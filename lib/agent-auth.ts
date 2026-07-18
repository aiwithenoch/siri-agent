import { createHash, randomBytes } from "node:crypto";

export function createAgentToken() {
  return randomBytes(24).toString("base64url");
}

export function hashAgentToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
