/**
 * Deterministic mirror of the backend's `buildClientLogin` (see
 * `artifacts/api-server/src/routes/clients.ts`). We use the client's email
 * when present, otherwise synthesize a stable address from the digits of
 * their mobile under the `@client.nutricare.local` domain.
 *
 * The default password (`Diet123`) is the standard credential the dietitian
 * shares with the client at handover.
 */

export const DEFAULT_CLIENT_PASSWORD = "Diet123";

export function buildClientLogin(
  email?: string | null,
  mobile?: string | null,
): string | null {
  const cleanEmail = (email ?? "").trim();
  if (cleanEmail.length > 0) return cleanEmail.toLowerCase();
  const digits = (mobile ?? "").replace(/\D/g, "");
  if (digits.length === 0) return null;
  return `${digits}@client.nutricare.local`;
}
