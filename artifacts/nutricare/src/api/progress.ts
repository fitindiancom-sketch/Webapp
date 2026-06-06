import { apiFetch } from "../lib/queryClient";
import { ProgressEntry } from "../types";

function mapRow(row: any): ProgressEntry {
  return {
    id: row.id,
    clientId: row.clientId,
    date: row.createdAt ?? "",
    weight: parseFloat(row.weightKg ?? "0"),
    notes: row.notes ?? "",
    dietitianNotes: row.dietitianNotes ?? "",
  };
}

export const progressApi = {
  list: async (clientId?: string): Promise<ProgressEntry[]> => {
    const url = clientId ? `/api/progress-logs?clientId=${clientId}` : "/api/progress-logs";
    const rows = await apiFetch<any[]>(url);
    return rows.map(mapRow);
  },
  get: async (id: string): Promise<ProgressEntry | undefined> => {
    try {
      const row = await apiFetch<any>(`/api/progress-logs/${id}`);
      return mapRow(row);
    } catch { return undefined; }
  },
  create: async (data: Omit<ProgressEntry, "id">): Promise<ProgressEntry> => {
    const row = await apiFetch<any>("/api/progress-logs", {
      method: "POST",
      body: JSON.stringify({
        clientId: data.clientId,
        weightKg: data.weight?.toString(),
        notes: data.notes,
        dietitianNotes: data.dietitianNotes,
      }),
    });
    return mapRow(row);
  },
  update: async (id: string, data: Partial<ProgressEntry>): Promise<ProgressEntry> => {
    const row = await apiFetch<any>(`/api/progress-logs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        weightKg: data.weight?.toString(),
        notes: data.notes,
        dietitianNotes: data.dietitianNotes,
      }),
    });
    return mapRow(row);
  },
  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/progress-logs/${id}`, { method: "DELETE" });
  },
};
