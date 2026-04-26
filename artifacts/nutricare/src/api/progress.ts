import { progressEntries as initialProgress } from "../mock/data";
import { ProgressEntry } from "../types";

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
let progressStore = [...initialProgress];

export const progressApi = {
  list: async (clientId?: string) => new Promise<ProgressEntry[]>(resolve => setTimeout(() => resolve(clientId ? progressStore.filter(p => p.clientId === clientId) : progressStore), 200)),
  get: async (id: string) => new Promise<ProgressEntry | undefined>(resolve => setTimeout(() => resolve(progressStore.find(p => p.id === id)), 200)),
  create: async (data: Omit<ProgressEntry, "id">) => new Promise<ProgressEntry>(resolve => {
    const newProgress = { ...data, id: `pr${Date.now()}` };
    progressStore.push(newProgress);
    setTimeout(() => resolve(newProgress), 200);
  }),
  update: async (id: string, data: Partial<ProgressEntry>) => new Promise<ProgressEntry>(resolve => {
    const index = progressStore.findIndex(p => p.id === id);
    if (index > -1) {
      progressStore[index] = { ...progressStore[index], ...data };
    }
    setTimeout(() => resolve(progressStore[index]), 200);
  }),
  remove: async (id: string) => new Promise<void>(resolve => {
    progressStore = progressStore.filter(p => p.id !== id);
    setTimeout(() => resolve(), 200);
  })
};
