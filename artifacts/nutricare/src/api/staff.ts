import { staff as initialStaff } from "../mock/data";
import { Staff } from "../types";

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
let staffStore = [...initialStaff];

export const staffApi = {
  list: async () => new Promise<Staff[]>(resolve => setTimeout(() => resolve(staffStore), 200)),
  get: async (id: string) => new Promise<Staff | undefined>(resolve => setTimeout(() => resolve(staffStore.find(s => s.id === id)), 200)),
  create: async (data: Omit<Staff, "id">) => new Promise<Staff>(resolve => {
    const newStaff = { ...data, id: `s${Date.now()}` };
    staffStore.push(newStaff);
    setTimeout(() => resolve(newStaff), 200);
  }),
  update: async (id: string, data: Partial<Staff>) => new Promise<Staff>(resolve => {
    const index = staffStore.findIndex(s => s.id === id);
    if (index > -1) {
      staffStore[index] = { ...staffStore[index], ...data };
    }
    setTimeout(() => resolve(staffStore[index]), 200);
  }),
  remove: async (id: string) => new Promise<void>(resolve => {
    staffStore = staffStore.filter(s => s.id !== id);
    setTimeout(() => resolve(), 200);
  })
};
