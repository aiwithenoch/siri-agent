import { NextRequest, NextResponse } from "next/server";
import { hashAgentToken } from "@/lib/agent-auth";
import { isBillingConfigured } from "@/lib/dodo";
import { getDatabase } from "@/lib/mongodb";
import { isComposioConfigured } from "@/lib/composio";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  if (!token) return NextResponse.json({ error: "Missing setup token." }, { status: 400 });

  const db = await getDatabase();
  const agent = await db.collection("agents").findOne({ tokenHash: hashAgentToken(token), status: "active" });
  if (!agent) return NextResponse.json({ error: "This setup link is invalid." }, { status: 404 });

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  return NextResponse.json({
    name: agent.name,
    email: agent.email,
    billingStatus: agent.billingStatus ?? "not_started",
    billingConfigured: isBillingConfigured(),
    webhookUrl: `${origin}/api/siri/${token}`,
    shortcutInstallUrl: process.env.NEXT_PUBLIC_SHORTCUT_INSTALL_URL ?? "",
    connectionsConfigured: isComposioConfigured(),
  });
}
