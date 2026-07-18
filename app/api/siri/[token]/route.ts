import { GoogleGenAI } from "@google/genai";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { hashAgentToken } from "@/lib/agent-auth";
import { getDatabase } from "@/lib/mongodb";
import { isBillingConfigured } from "@/lib/dodo";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "gemini-3.5-flash";
const DAILY_LIMIT = 30;

type RouteContext = { params: Promise<{ token: string }> };
type StoredMessage = { role: "user" | "assistant"; content: string; createdAt: Date };

function extractQuery(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const value = (body as Record<string, unknown>).query ??
    (body as Record<string, unknown>).text ??
    (body as Record<string, unknown>).prompt;
  return typeof value === "string" ? value.trim().slice(0, 800) : "";
}

async function handleRequest(request: NextRequest, context: RouteContext, queryFromUrl?: string) {
  const { token } = await context.params;
  const tokenHash = hashAgentToken(token);
  let query = queryFromUrl?.trim().slice(0, 800) ?? "";

  if (!query && request.method === "POST") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      query = extractQuery(await request.json());
    } else {
      const form = await request.formData();
      query = String(form.get("query") ?? form.get("text") ?? "").trim().slice(0, 800);
    }
  }

  if (!query) {
    return NextResponse.json({ error: "Ask your agent a question." }, { status: 400 });
  }

  try {
    const db = await getDatabase();
    const agent = await db.collection("agents").findOne({ tokenHash, status: "active" });

    if (!agent) {
      return NextResponse.json({ error: "This Siri connection is invalid or disabled." }, { status: 401 });
    }

    if (isBillingConfigured() && agent.billingStatus !== "active") {
      return NextResponse.json(
        { error: "Your cloud trial or subscription is not active. Open your private setup page to continue." },
        { status: 402 },
      );
    }

    const day = new Date().toISOString().slice(0, 10);
    const usage = await db.collection("daily_usage").findOneAndUpdate(
      { tokenHash, day },
      {
        $inc: { count: 1 },
        $setOnInsert: { createdAt: new Date() },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, returnDocument: "after" },
    );

    if ((usage?.count ?? 1) > DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Your agent has reached its free daily conversation limit." },
        { status: 429 },
      );
    }

    const recent = await db
      .collection<StoredMessage>("messages")
      .find({ agentId: agent._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const history = recent.reverse().map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [...history, { role: "user", parts: [{ text: query }] }],
      config: {
        systemInstruction:
          `You are ${agent.name}'s personal Siri agent. Respond naturally for speech. ` +
          "Be concise, helpful, and honest. Use the conversation history for continuity. " +
          "Never claim you completed an external action unless a tool result proves it. " +
          "For this early test, explain that app actions are coming soon when asked to send, book, or modify something.",
        temperature: 0.4,
        maxOutputTokens: 640,
      },
    });

    const answer = response.text?.trim();
    if (!answer) throw new Error("Gemini returned an empty response");

    const now = new Date();
    await Promise.all([
      db.collection("messages").insertMany([
        { agentId: agent._id as ObjectId, role: "user", content: query, createdAt: now },
        { agentId: agent._id as ObjectId, role: "assistant", content: answer, createdAt: now },
      ]),
      db.collection("agents").updateOne({ _id: agent._id }, { $set: { lastSeenAt: now } }),
    ]);

    return NextResponse.json({
      answer,
      agent: agent.name,
      remaining: Math.max(0, DAILY_LIMIT - (usage?.count ?? 1)),
      model: MODEL,
    });
  } catch (error) {
    console.error("Siri request failed", error);
    return NextResponse.json(
      { error: "Your agent could not answer just now. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context);
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context, request.nextUrl.searchParams.get("q") ?? "");
}
