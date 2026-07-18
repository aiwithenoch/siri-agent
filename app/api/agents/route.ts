import { NextRequest, NextResponse } from "next/server";
import { createAgentToken, hashAgentToken, hashIdentifier } from "@/lib/agent-auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

function requestIp(request: NextRequest) {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  ).split(",")[0].trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name?: unknown; email?: unknown };
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";

    if (name.length < 2) {
      return NextResponse.json({ error: "Enter your name to create an agent." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const db = await getDatabase();
    const ip = requestIp(request);
    const ipHash = hashIdentifier(ip);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAgents = ip === "unknown"
      ? 0
      : await db.collection("agents").countDocuments({ ipHash, createdAt: { $gte: since } });

    if (recentAgents >= 25) {
      return NextResponse.json(
        { error: "This device has reached today’s test-agent limit." },
        { status: 429 },
      );
    }

    const token = createAgentToken();
    const now = new Date();
    await db.collection("agents").insertOne({
      name,
      email,
      tokenHash: hashAgentToken(token),
      ipHash,
      status: "active",
      ownerAccess: false,
      billingStatus: "not_started",
      createdAt: now,
      lastSeenAt: now,
    });

    const webhookUrl = `${request.nextUrl.origin}/api/siri`;
    return NextResponse.json({
      name,
      email,
      webhookUrl,
      setupUrl: `/setup/${token}`,
      privateKey: token,
      phrase: "Agent",
      dailyLimit: 30,
    });
  } catch (error) {
    console.error("Agent creation failed", error);
    return NextResponse.json({ error: "Could not create your agent. Try again." }, { status: 500 });
  }
}
