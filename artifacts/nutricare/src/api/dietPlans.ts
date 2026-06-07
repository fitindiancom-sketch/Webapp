import { apiFetch } from "../lib/queryClient";
import { DietPlan } from "../types";

function mapRow(row: any): DietPlan {
  const meals = (row.meals ?? []).map((m: any) => ({
    mealType: m.mealType,
    items: typeof m.content === "string"
      ? m.content.split("\n").filter(Boolean)
      : (m.content ?? []),
  }));

  const mustDoSection = (row.sections ?? []).find((s: any) => s.sectionType === "must_do");
  const mustDo = mustDoSection
    ? typeof mustDoSection.content === "string"
      ? mustDoSection.content.split("\n").filter(Boolean)
      : mustDoSection.content
    : [];

  return {
    id: row.id,
    clientId: row.clientId,
    dietitianId: row.dietitianId ?? "",
    category: mapCategory(row.status),
    mustDo,
    waterGoal: parseFloat(row.waterGoalL ?? row.waterGoal ?? "3"),
    meals,
    createdAt: row.createdAt ?? "",
    status: row.status === "active" ? "Published" : "Draft",
  };
}

function mapCategory(status: string): DietPlan["category"] {
  if (status === "active") return "Active";
  if (status === "completed") return "Renewal";
  return "New";
}

export const dietPlansApi = {
  list: async (clientId?: string): Promise<DietPlan[]> => {
    const url = clientId
      ? `/api/diet-plans?clientId=${clientId}`
      : "/api/diet-plans";
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
    const planCode = `dp-${Date.now()}`;
    const row = await apiFetch<any>("/api/diet-plans", {
      method: "POST",
      body: JSON.stringify({
        clientId: data.clientId,
        dietitianId: data.dietitianId || undefined,
        planCode,
        planName: `Diet Plan - ${new Date().toLocaleDateString()}`,
        waterGoalL: data.waterGoal?.toString() ?? "3.0",
        status: data.status === "Published" ? "active" : "draft",
      }),
    });

    // Save each meal separately
    for (const meal of data.meals ?? []) {
      await apiFetch(`/api/diet-plans/${row.id}/meals/${meal.mealType}`, {
        method: "PUT",
        body: JSON.stringify({
          content: Array.isArray(meal.items)
            ? meal.items.join("\n")
            : meal.items,
          orderIndex: 0,
        }),
      });
    }

    // Save must_do section
    if (data.mustDo?.length) {
      await apiFetch(`/api/diet-plans/${row.id}/sections/must_do`, {
        method: "PUT",
        body: JSON.stringify({
          content: Array.isArray(data.mustDo)
            ? data.mustDo.join("\n")
            : data.mustDo,
        }),
      });
    }

    return mapRow({ ...row, meals: [], sections: [] });
  },

  update: async (id: string, data: Partial<DietPlan>): Promise<DietPlan> => {
    const row = await apiFetch<any>(`/api/diet-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        waterGoalL: data.waterGoal?.toString(),
        status: data.status === "Published" ? "active" : "draft",
      }),
    });

    // Update each meal separately
    for (const meal of data.meals ?? []) {
      await apiFetch(`/api/diet-plans/${id}/meals/${meal.mealType}`, {
        method: "PUT",
        body: JSON.stringify({
          content: Array.isArray(meal.items)
            ? meal.items.join("\n")
            : meal.items,
          orderIndex: 0,
        }),
      });
    }

    // Update must_do section
    if (data.mustDo?.length) {
      await apiFetch(`/api/diet-plans/${id}/sections/must_do`, {
        method: "PUT",
        body: JSON.stringify({
          content: Array.isArray(data.mustDo)
            ? data.mustDo.join("\n")
            : data.mustDo,
        }),
      });
    }

    return mapRow(row);
  },

  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/diet-plans/${id}`, { method: "DELETE" });
  },
};
