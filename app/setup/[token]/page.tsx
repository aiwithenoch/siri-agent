import type { Metadata } from "next";
import { SetupAgent } from "@/app/components/SetupAgent";

export const metadata: Metadata = { title: "Set up Agent for Siri" };

export default async function SetupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SetupAgent token={token} />;
}

