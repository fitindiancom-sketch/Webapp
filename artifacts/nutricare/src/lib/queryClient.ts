export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (res.status === 401) {
    const err: any = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error(text || `Request failed with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
