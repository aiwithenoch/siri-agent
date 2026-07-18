import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

let client: Composio | undefined;
let vercelClient: Composio<VercelProvider> | undefined;

export function isComposioConfigured() {
  return Boolean(process.env.COMPOSIO_API_KEY);
}

export function getComposio() {
  if (!process.env.COMPOSIO_API_KEY) throw new Error("COMPOSIO_API_KEY is not configured");
  client ??= new Composio({ apiKey: process.env.COMPOSIO_API_KEY, disableVersionCheck: true });
  return client;
}

export function getComposioForVercel() {
  if (!process.env.COMPOSIO_API_KEY) throw new Error("COMPOSIO_API_KEY is not configured");
  vercelClient ??= new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
    provider: new VercelProvider(),
    disableVersionCheck: true,
  });
  return vercelClient;
}
