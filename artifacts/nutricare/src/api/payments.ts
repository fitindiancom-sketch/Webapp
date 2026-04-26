import { payments as initialPayments } from "../mock/data";
import { Payment } from "../types";

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
let paymentsStore = [...initialPayments];

export const paymentsApi = {
  list: async () => new Promise<Payment[]>(resolve => setTimeout(() => resolve(paymentsStore), 200)),
  get: async (id: string) => new Promise<Payment | undefined>(resolve => setTimeout(() => resolve(paymentsStore.find(p => p.id === id)), 200)),
  create: async (data: Omit<Payment, "id">) => new Promise<Payment>(resolve => {
    const newPayment = { ...data, id: `p${Date.now()}` };
    paymentsStore.push(newPayment);
    setTimeout(() => resolve(newPayment), 200);
  }),
  update: async (id: string, data: Partial<Payment>) => new Promise<Payment>(resolve => {
    const index = paymentsStore.findIndex(p => p.id === id);
    if (index > -1) {
      paymentsStore[index] = { ...paymentsStore[index], ...data };
    }
    setTimeout(() => resolve(paymentsStore[index]), 200);
  }),
  remove: async (id: string) => new Promise<void>(resolve => {
    paymentsStore = paymentsStore.filter(p => p.id !== id);
    setTimeout(() => resolve(), 200);
  })
};
