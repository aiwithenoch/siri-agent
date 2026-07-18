import { NextRequest, NextResponse } from "next/server";
import { hashAgentToken } from "@/lib/agent-auth";
import { getComposio, isComposioConfigured } from "@/lib/composio";
import { isBillingConfigured } from "@/lib/dodo";
import { getDatabase } from "@/lib/mongodb";
import { hasCloudAccess } from "@/lib/access";

const supported = new Set([
  "gmail", "googlecalendar", "googledrive", "slack", "notion", "github",
  "linear", "zoom", "hubspot", "salesforce", "trello", "asana", "dropbox", "discord",
]);

async function getAgent(token: string) {
  if (!token) return null;
  const db = await getDatabase();
  return db.collection("agents").findOne({ tokenHash: hashAgentToken(token), status: "active" });
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1] ?? "";
    const agent = await getAgent(token);
    if (!agent) return NextResponse.json({ error: "Invalid private setup link." }, { status: 404 });
    if (!isComposioConfigured()) return NextResponse.json({ configured: false, connections: {} });
    const result = await getComposio().connectedAccounts.list({ userIds: [agent._id.toString()], toolkitSlugs: [...supported] });
    const connections = Object.fromEntries([...supported].map((slug) => [slug, result.items.some((item) => item.toolkit.slug === slug && item.status === "ACTIVE")]));
    return NextResponse.json({ configured: true, connections });
  } catch (error) {
    console.error("Could not list Composio connections", error);
    return NextResponse.json({ configured: false, connections: {}, error: "App connections need a valid Composio API key." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token = "", toolkit = "" } = await request.json();
    if (!supported.has(toolkit)) return NextResponse.json({ error: "Unsupported app." }, { status: 400 });
    const agent = await getAgent(String(token).trim());
    if (!agent) return NextResponse.json({ error: "Invalid private setup link." }, { status: 404 });
    if (!hasCloudAccess(agent.ownerAccess, agent.billingStatus, isBillingConfigured())) return NextResponse.json({ error: "Start your free day before connecting apps." }, { status: 402 });
    if (!isComposioConfigured()) return NextResponse.json({ error: "App connections are being activated." }, { status: 503 });
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const callbackUrl = `${origin}/setup/${encodeURIComponent(token)}?connected=${encodeURIComponent(toolkit)}`;
    const session = await getComposio().sessions.create(agent._id.toString(), { toolkits: [toolkit] });
    const connection = await session.authorize(toolkit, { callbackUrl });
    if (!connection.redirectUrl) return NextResponse.json({ error: "This app could not open its sign-in page." }, { status: 502 });
    return NextResponse.json({ redirectUrl: connection.redirectUrl });
  } catch (error) {
    console.error("Could not start Composio connection", error);
    return NextResponse.json({ error: "Composio rejected the configured credential. Add a valid project API key." }, { status: 502 });
  }
}
