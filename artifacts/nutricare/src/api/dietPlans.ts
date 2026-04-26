import { DietPlan } from "../types";

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
let dietPlansStore: DietPlan[] = [];

export const dietPlansApi = {
  list: async () => new Promise<DietPlan[]>(resolve => setTimeout(() => resolve(dietPlansStore), 200)),
  get: async (id: string) => new Promise<DietPlan | undefined>(resolve => setTimeout(() => resolve(dietPlansStore.find(dp => dp.id === id)), 200)),
  create: async (data: Omit<DietPlan, "id">) => new Promise<DietPlan>(resolve => {
    const newPlan = { ...data, id: `dp${Date.now()}` };
    dietPlansStore.push(newPlan);
    setTimeout(() => resolve(newPlan), 200);
  }),
  update: async (id: string, data: Partial<DietPlan>) => new Promise<DietPlan>(resolve => {
    const index = dietPlansStore.findIndex(dp => dp.id === id);
    if (index > -1) {
      dietPlansStore[index] = { ...dietPlansStore[index], ...data };
    }
    setTimeout(() => resolve(dietPlansStore[index]), 200);
  }),
  remove: async (id: string) => new Promise<void>(resolve => {
    dietPlansStore = dietPlansStore.filter(dp => dp.id !== id);
    setTimeout(() => resolve(), 200);
  })
};
