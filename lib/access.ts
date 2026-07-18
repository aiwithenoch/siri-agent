export function hasOwnerAccess(ownerAccess: unknown) {
  return ownerAccess === true;
}

export function hasCloudAccess(ownerAccess: unknown, billingStatus: unknown, billingConfigured: boolean) {
  return hasOwnerAccess(ownerAccess) || !billingConfigured || billingStatus === "active";
}
