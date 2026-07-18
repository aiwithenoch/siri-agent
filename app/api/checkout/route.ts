import { NextRequest, NextResponse } from "next/server";
import { getDodoClient } from "@/lib/dodo";
import { hashAgentToken } from "@/lib/agent-auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: unknown };
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!token) return NextResponse.json({ error: "Your private Agent link is missing." }, { status: 400 });

    const db = await getDatabase();
    const agent = await db.collection("agents").findOne({ tokenHash: hashAgentToken(token), status: "active" });
    if (!agent) return NextResponse.json({ error: "This Agent setup link is invalid." }, { status: 404 });

    const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
    if (!productId) {
      return NextResponse.json({ error: "Payments are being connected. Please try again shortly." }, { status: 503 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const client = getDodoClient();
    const checkout = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      subscription_data: { trial_period_days: 1 },
      customer: { email: agent.email, name: agent.name },
      allowed_payment_method_types: ["credit", "debit"],
      return_url: `${origin}/setup/${token}?checkout=complete`,
      cancel_url: `${origin}/setup/${token}?checkout=cancelled`,
      metadata: { agent_id: String(agent._id) },
      customization: { theme: "light", show_order_details: true },
      feature_flags: { allow_customer_editing_email: true, allow_customer_editing_name: true },
    });

    await db.collection("agents").updateOne(
      { _id: agent._id },
      {
        $set: {
          billingStatus: "checkout_pending",
          checkoutSessionId: checkout.session_id,
          updatedAt: new Date(),
        },
      },
    );

    if (!checkout.checkout_url) throw new Error("Dodo did not return a checkout URL");
    return NextResponse.json({ checkoutUrl: checkout.checkout_url });
  } catch (error) {
    console.error("Checkout creation failed", error);
    return NextResponse.json({ error: "Checkout could not start. Please try again." }, { status: 500 });
  }
}
