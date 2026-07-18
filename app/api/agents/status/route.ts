import { NextRequest, NextResponse } from "next/server";
import { hashAgentToken } from "@/lib/agent-auth";
import { isBillingConfigured } from "@/lib/dodo";
import { getDatabase } from "@/lib/mongodb";
import { isComposioConfigured } from "@/lib/composio";
import { hasCloudAccess, hasOwnerAccess } from "@/lib/access";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1] ?? "";
  if (!token) return NextResponse.json({ error: "Missing setup token." }, { status: 400 });

  const db = await getDatabase();
  const agent = await db.collection("agents").findOne({ tokenHash: hashAgentToken(token), status: "active" });
  if (!agent) return NextResponse.json({ error: "This setup link is invalid." }, { status: 404 });

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const billingConfigured = isBillingConfigured();
  return NextResponse.json({
    name: agent.name,
    email: agent.email,
    billingStatus: agent.billingStatus ?? "not_started",
    billingConfigured,
    accessGranted: hasCloudAccess(agent.ownerAccess, agent.billingStatus, billingConfigured),
    ownerAccess: hasOwnerAccess(agent.ownerAccess),
    webhookUrl: `${origin}/api/siri`,
    privateKey: token,
    shortcutInstallUrl: process.env.NEXT_PUBLIC_SHORTCUT_INSTALL_URL ?? "",
    connectionsConfigured: isComposioConfigured(),
  });
}
