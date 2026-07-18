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
  assert.match(setup, /Install Agent on iPhone/);
  assert.match(setup, /Paste when Apple asks/);
  assert.match(setup, /\$5\/month/);
  assert.doesNotMatch(setup, /JSON field|Get Dictionary Value|Authorization header/);
  assert.match(setup, /slack-icon\.svg/);
  assert.match(setup, /logos\/salesforce\.svg/);
});

test("requires server-owned billing state before cloud access", async () => {
  const [checkout, webhook, siri, dodo, access, agents] = await Promise.all([
    read("app/api/checkout/route.ts"),
    read("app/api/webhooks/dodo/route.ts"),
    read("app/api/siri/route.ts"),
    read("lib/dodo.ts"),
    read("lib/access.ts"),
    read("app/api/agents/route.ts"),
  ]);

  assert.match(checkout, /trial_period_days:\s*1/);
  assert.match(checkout, /allowed_payment_method_types:\s*\["credit",\s*"debit"\]/);
  assert.match(webhook, /webhooks\.unwrap/);
  assert.match(webhook, /webhookId/);
  assert.match(siri, /hasCloudAccess/);
  assert.match(access, /billingStatus === "active"/);
  assert.doesNotMatch(access, /aiwithenoch@gmail\.com/);
  assert.match(access, /ownerAccess === true/);
  assert.match(agents, /ownerAccess:\s*false/);
  assert.match(dodo, /DODO_PAYMENTS_WEBHOOK_KEY/);
});

test("keeps reusable setup credentials out of API query strings", async () => {
  const [setup, status, connections] = await Promise.all([
    read("app/components/SetupAgent.tsx"),
    read("app/api/agents/status/route.ts"),
    read("app/api/connections/route.ts"),
  ]);

  assert.doesNotMatch(setup, /\?token=/);
  assert.match(setup, /Authorization:\s*`Bearer \$\{token\}`/);
  assert.match(status, /headers\.get\("authorization"\)/);
  assert.match(connections, /headers\.get\("authorization"\)/);
  assert.doesNotMatch(status, /searchParams\.get\("token"\)/);
  assert.doesNotMatch(connections, /searchParams\.get\("token"\)/);
});

test("does not expose the tool-capable Siri handler over GET", async () => {
  const siri = await read("app/api/siri/route.ts");
  assert.match(siri, /export async function POST/);
  assert.doesNotMatch(siri, /export async function GET/);
  assert.doesNotMatch(siri, /searchParams\.get\("q"\)/);
  assert.match(siri, /headers\.get\("authorization"\)/);
  assert.doesNotMatch(siri, /params:\s*Promise<\{\s*token/);
});

test("reuses the Mongo client promise in production", async () => {
  const mongodb = await read("lib/mongodb.ts");
  assert.match(mongodb, /globalForMongo\.mongoClientPromise = new MongoClient/);
  assert.doesNotMatch(mongodb, /NODE_ENV !== "production"/);
  assert.match(mongodb, /mongoClientPromise = undefined/);
});
