import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DietPlanTemplate } from "../types";
import { seedDietPlanTemplates } from "../mock/data";

export interface DietPlanMeal {
  type: string;
  content: string;
}

export interface SavedDietPlan {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  dietitianId: string;
  dietitianName: string;
  goalWeight: string;
  category: string;
  mustDo: string;
  instructions: string;
  waterGoal: number;
  meals: DietPlanMeal[];
  createdAt: string;
  status: "Draft" | "Published";
}

interface DietPlanStore {
  templates: DietPlanTemplate[];
  plans: SavedDietPlan[];
  draft: Partial<SavedDietPlan> | null;

  addTemplate: (t: Omit<DietPlanTemplate, "id" | "createdAt">) => void;
  updateTemplate: (id: string, t: Partial<DietPlanTemplate>) => void;
  deleteTemplate: (id: string) => void;

  savePlan: (plan: Omit<SavedDietPlan, "id" | "createdAt" | "status"> & { status?: "Draft" | "Published" }) => SavedDietPlan;
  saveDraft: (plan: Partial<SavedDietPlan>) => void;
  clearDraft: () => void;
  deletePlan: (id: string) => void;
}

export const useDietPlanStore = create<DietPlanStore>()(
  persist(
    (set, get) => ({
      templates: seedDietPlanTemplates,
      plans: [],
      draft: null,

      addTemplate: (t) =>
        set((s) => ({
          templates: [
            ...s.templates,
            { ...t, id: `tpl-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) },
          ],
        })),
      updateTemplate: (id, patch) =>
        set((s) => ({
          templates: s.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      savePlan: (plan) => {
        const newPlan: SavedDietPlan = {
          ...plan,
          id: `dp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: plan.status ?? "Published",
        };
        set((s) => ({ plans: [newPlan, ...s.plans], draft: null }));
        return newPlan;
      },
      saveDraft: (plan) => set({ draft: plan }),
      clearDraft: () => set({ draft: null }),
      deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
    }),
    {
      name: "nutricare-diet-plans",
      version: 1,
    }
  )
);
