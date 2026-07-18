import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("ships the nontechnical Siri onboarding flow", async () => {
  const [home, connect, setup] = await Promise.all([
    read("app/page.tsx"),
    read("app/components/ConnectSiri.tsx"),
    read("app/components/SetupAgent.tsx"),
  ]);

  assert.match(home, /Hey Siri, Agent/);
  assert.match(connect, /1 day free/);
  assert.match(connect, /Create my Agent/);
  assert.match(setup, /Copy private link/);
  assert.match(setup, /Add Agent to Siri/);
  assert.match(setup, /\$5\/month/);
  assert.doesNotMatch(setup, /JSON field|Get Dictionary Value/);
});

test("requires signed billing state before cloud access", async () => {
  const [checkout, webhook, siri, dodo] = await Promise.all([
    read("app/api/checkout/route.ts"),
    read("app/api/webhooks/dodo/route.ts"),
    read("app/api/siri/[token]/route.ts"),
    read("lib/dodo.ts"),
  ]);

  assert.match(checkout, /trial_period_days:\s*1/);
  assert.match(checkout, /allowed_payment_method_types:\s*\["credit",\s*"debit"\]/);
  assert.match(webhook, /webhooks\.unwrap/);
  assert.match(webhook, /webhookId/);
  assert.match(siri, /billingStatus !== "active"/);
  assert.match(dodo, /DODO_PAYMENTS_WEBHOOK_KEY/);
});
