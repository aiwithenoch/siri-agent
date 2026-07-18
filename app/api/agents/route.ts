import { NextRequest, NextResponse } from "next/server";
import { createAgentToken, hashAgentToken, hashIdentifier } from "@/lib/agent-auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

function requestIp(request: NextRequest) {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    "unknown"
  ).split(",")[0].trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";

    if (name.length < 2) {
      return NextResponse.json({ error: "Enter your name to create an agent." }, { status: 400 });
    }

    const db = await getDatabase();
    const ipHash = hashIdentifier(requestIp(request));
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAgents = await db.collection("agents").countDocuments({ ipHash, createdAt: { $gte: since } });

    if (recentAgents >= 5) {
      return NextResponse.json(
        { error: "This device has reached today’s test-agent limit." },
        { status: 429 },
      );
    }

    const token = createAgentToken();
    const now = new Date();
    await db.collection("agents").insertOne({
      name,
      tokenHash: hashAgentToken(token),
      ipHash,
      status: "active",
      createdAt: now,
      lastSeenAt: now,
    });

    const webhookUrl = `${request.nextUrl.origin}/api/siri/${token}`;
    return NextResponse.json({
      name,
      webhookUrl,
      phrase: "Agent",
      dailyLimit: 30,
    });
  } catch (error) {
    console.error("Agent creation failed", error);
    return NextResponse.json({ error: "Could not create your agent. Try again." }, { status: 500 });
  }
}
