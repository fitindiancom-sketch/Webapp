/**
 * Pull a user-friendly message out of an error thrown by `apiFetch`.
 * The backend returns JSON like `{"message": "..."}`; `apiFetch` puts the raw
 * response body in `Error.message`. This helper parses it back out.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (!err) return fallback;
  const raw = err instanceof Error ? err.message : String(err);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    // Not JSON — fall through and return raw text.
  }
  return raw || fallback;
}
