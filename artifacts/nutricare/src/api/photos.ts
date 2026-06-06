import { apiFetch } from "../lib/queryClient";
import { Photo } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "";

function mapRow(row: any): Photo {
  return {
    id: row.id,
    clientId: row.clientId,
    url: row.url,
    mealType: row.mealType ?? "Breakfast",
    caption: row.caption ?? "",
    uploadedAt: row.uploadedAt ?? "",
    date: row.uploadedAt ?? "",
  };
}

export const photosApi = {
  list: async (clientId?: string): Promise<Photo[]> => {
    const url = clientId ? `/api/photos?clientId=${clientId}` : "/api/photos";
    const rows = await apiFetch<any[]>(url);
    return rows.map(mapRow);
  },
  get: async (id: string): Promise<Photo | undefined> => {
    try {
      const row = await apiFetch<any>(`/api/photos/${id}`);
      return mapRow(row);
    } catch { return undefined; }
  },
  create: async (clientId: string, file: File, mealType: string, caption?: string): Promise<Photo> => {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("clientId", clientId);
    formData.append("mealType", mealType);
    if (caption) formData.append("caption", caption);

    const res = await fetch(`${API_BASE}/api/photos`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Photo upload failed");
    const row = await res.json();
    return mapRow(row);
  },
  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/photos/${id}`, { method: "DELETE" });
  },
};
