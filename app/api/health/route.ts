import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "siri-agent",
    databaseConfigured: Boolean(process.env.MONGODB_URI),
    modelConfigured: Boolean(process.env.GEMINI_API_KEY),
    billingConfigured: Boolean(
      process.env.DODO_PAYMENTS_API_KEY &&
        process.env.DODO_PAYMENTS_WEBHOOK_KEY &&
        process.env.DODO_PAYMENTS_PRODUCT_ID,
    ),
    shortcutConfigured: Boolean(process.env.NEXT_PUBLIC_SHORTCUT_INSTALL_URL),
  });
}
