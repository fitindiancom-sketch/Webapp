import { apiFetch } from "../lib/queryClient";
import { DietPlan } from "../types";

function mapRow(row: any): DietPlan {
  return {
    id: row.id,
    clientId: row.clientId,
    dietitianId: row.createdBy ?? "",
    category: row.category ?? "New",
    mustDo: row.mustDo ?? [],
    waterGoal: row.waterGoalLiters ?? 2,
    meals: row.meals ?? [],
    createdAt: row.createdAt ?? "",
    status: row.status ?? "active",
  };
}

export const dietPlansApi = {
  list: async (clientId?: string): Promise<DietPlan[]> => {
    const url = clientId ? `/api/diet-plans?clientId=${clientId}` : "/api/diet-plans";
    const rows = await apiFetch<any[]>(url);
    return rows.map(mapRow);
  },
  get: async (id: string): Promise<DietPlan | undefined> => {
    try {
      const row = await apiFetch<any>(`/api/diet-plans/${id}`);
      return mapRow(row);
    } catch { return undefined; }
  },
  create: async (data: Omit<DietPlan, "id">): Promise<DietPlan> => {
    const row = await apiFetch<any>("/api/diet-plans", {
      method: "POST",
      body: JSON.stringify({
        clientId: data.clientId,
        category: data.category,
        mustDo: data.mustDo,
        waterGoalLiters: data.waterGoal,
        meals: data.meals,
        status: "active",
      }),
    });
    return mapRow(row);
  },
  update: async (id: string, data: Partial<DietPlan>): Promise<DietPlan> => {
    const row = await apiFetch<any>(`/api/diet-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        category: data.category,
        mustDo: data.mustDo,
        waterGoalLiters: data.waterGoal,
        meals: data.meals,
        status: (data as any).status,
      }),
    });
    return mapRow(row);
  },
  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/diet-plans/${id}`, { method: "DELETE" });
  },
};
