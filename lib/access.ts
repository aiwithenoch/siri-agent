const OWNER_EMAILS = new Set(["aiwithenoch@gmail.com"]);

export function hasOwnerAccess(email: unknown) {
  return typeof email === "string" && OWNER_EMAILS.has(email.trim().toLowerCase());
}

export function hasCloudAccess(email: unknown, billingStatus: unknown, billingConfigured: boolean) {
  return hasOwnerAccess(email) || !billingConfigured || billingStatus === "active";
}
