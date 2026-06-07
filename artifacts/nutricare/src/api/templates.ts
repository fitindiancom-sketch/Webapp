import { apiFetch } from "../lib/queryClient";
import { DietPlanTemplate } from "../types";

function mapRow(row: any): DietPlanTemplate {
  return {
    id: row.id,
    category: row.category,
    name: row.title,
    content: row.content,
    createdAt: row.createdAt ?? "",
  };
}

export const templatesApi = {
  list: async (category?: string): Promise<DietPlanTemplate[]> => {
    const url = category
      ? `/api/templates?category=${category}`
      : "/api/templates";
    const rows = await apiFetch<any[]>(url);
    return rows.map(mapRow);
  },

  get: async (id: string): Promise<DietPlanTemplate | undefined> => {
    try {
      const rows = await apiFetch<any[]>("/api/templates");
      const row = rows.find((r: any) => r.id === id);
      return row ? mapRow(row) : undefined;
    } catch { return undefined; }
  },

  create: async (data: Omit<DietPlanTemplate, "id" | "createdAt">): Promise<DietPlanTemplate> => {
    const row = await apiFetch<any>("/api/templates", {
      method: "POST",
      body: JSON.stringify({
        category: data.category,
        title: data.name,
        content: data.content,
      }),
    });
    return mapRow(row);
  },

  update: async (id: string, data: Partial<DietPlanTemplate>): Promise<DietPlanTemplate> => {
    const row = await apiFetch<any>(`/api/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        category: data.category,
        title: data.name,
        content: data.content,
      }),
    });
    return mapRow(row);
  },

  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/templates/${id}`, { method: "DELETE" });
  },
};
