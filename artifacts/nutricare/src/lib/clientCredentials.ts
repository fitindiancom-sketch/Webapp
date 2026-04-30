/**
 * Deterministic mirror of the backend's `buildClientLogin` (see
 * `artifacts/api-server/src/routes/clients.ts`). Mobile is the primary
 * identifier — we synthesize a stable address from the mobile digits under
 * the `@client.nutricare.local` domain. We only fall back to the client's
 * real email when no mobile is on file.
 *
 * The default password (`Diet123`) is the standard credential the dietitian
 * shares with the client at handover.
 */

export const DEFAULT_CLIENT_PASSWORD = "Diet123";

export function buildClientLogin(
  email?: string | null,
  mobile?: string | null,
): string | null {
  const digits = (mobile ?? "").replace(/\D/g, "");
  if (digits.length > 0) return `${digits}@client.nutricare.local`;
  const cleanEmail = (email ?? "").trim();
  if (cleanEmail.length > 0) return cleanEmail.toLowerCase();
  return null;
}
