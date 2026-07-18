import DodoPayments from "dodopayments";

let client: DodoPayments | null = null;

export function isBillingConfigured() {
  return Boolean(
    process.env.DODO_PAYMENTS_API_KEY &&
      process.env.DODO_PAYMENTS_PRODUCT_ID &&
      process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  );
}

export function getDodoClient() {
  if (client) return client;

  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) throw new Error("DODO_PAYMENTS_API_KEY is not configured");

  client = new DodoPayments({
    bearerToken,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });
  return client;
}

