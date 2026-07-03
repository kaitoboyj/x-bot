// Wallet encryption is disabled. Secrets are stored as-is and purged after 48h
// by the wallet-cleanup cron. These helpers are kept as pass-throughs so the
// rest of the codebase doesn't have to change.

export function encryptSecret(value: string): string {
  return value;
}

export function decryptSecret(value: string): string {
  return value;
}
