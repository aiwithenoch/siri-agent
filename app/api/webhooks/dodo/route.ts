import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDodoClient } from "@/lib/dodo";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

type DodoEvent = {
  type: string;
  data?: Record<string, unknown>;
};

const ACTIVE_EVENTS = new Set(["subscription.active", "subscription.renewed", "payment.succeeded"]);
const INACTIVE_EVENTS = new Set([
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
  "subscription.on_hold",
  "payment.failed",
]);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const webhookId = request.headers.get("webhook-id") ?? "";
  const headers = {
    "webhook-id": webhookId,
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  };

  let event: DodoEvent;
  try {
    event = getDodoClient().webhooks.unwrap(rawBody, { headers }) as unknown as DodoEvent;
  } catch (error) {
    console.error("Invalid Dodo webhook", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const db = await getDatabase();
  if (webhookId) {
    const claimed = await db.collection("webhook_events").updateOne(
      { webhookId },
      { $setOnInsert: { webhookId, type: event.type, receivedAt: new Date() } },
      { upsert: true },
    );
    if (!claimed.upsertedCount) return NextResponse.json({ received: true, duplicate: true });
  }

  const data = event.data ?? {};
  const metadata = (data.metadata && typeof data.metadata === "object" ? data.metadata : {}) as Record<string, unknown>;
  const agentId = typeof metadata.agent_id === "string" ? metadata.agent_id : "";

  if (ObjectId.isValid(agentId) && (ACTIVE_EVENTS.has(event.type) || INACTIVE_EVENTS.has(event.type))) {
    const billingStatus = ACTIVE_EVENTS.has(event.type) ? "active" : "inactive";
    await db.collection("agents").updateOne(
      { _id: new ObjectId(agentId) },
      {
        $set: {
          billingStatus,
          subscriptionId: data.subscription_id ?? data.id ?? null,
          customerId: data.customer_id ?? null,
          billingEvent: event.type,
          updatedAt: new Date(),
        },
      },
    );
  }

  return NextResponse.json({ received: true });
}

