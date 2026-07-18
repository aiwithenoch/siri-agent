import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "siri-agent",
    databaseConfigured: Boolean(process.env.MONGODB_URI),
    modelConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
