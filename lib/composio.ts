import { Composio } from "@composio/core";

let client: Composio | undefined;

export function isComposioConfigured() {
  return Boolean(process.env.COMPOSIO_API_KEY);
}

export function getComposio() {
  if (!process.env.COMPOSIO_API_KEY) throw new Error("COMPOSIO_API_KEY is not configured");
  client ??= new Composio({ apiKey: process.env.COMPOSIO_API_KEY, disableVersionCheck: true });
  return client;
}
