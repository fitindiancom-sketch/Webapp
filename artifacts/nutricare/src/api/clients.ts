import { clients as initialClients } from "../mock/data";
import { Client } from "../types";

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
let clientsStore = [...initialClients];

export const clientsApi = {
  list: async () => new Promise<Client[]>(resolve => setTimeout(() => resolve(clientsStore), 200)),
  get: async (id: string) => new Promise<Client | undefined>(resolve => setTimeout(() => resolve(clientsStore.find(c => c.id === id)), 200)),
  create: async (data: Omit<Client, "id">) => new Promise<Client>(resolve => {
    const newClient = { ...data, id: `c${Date.now()}` };
    clientsStore.push(newClient);
    setTimeout(() => resolve(newClient), 200);
  }),
  update: async (id: string, data: Partial<Client>) => new Promise<Client>(resolve => {
    const index = clientsStore.findIndex(c => c.id === id);
    if (index > -1) {
      clientsStore[index] = { ...clientsStore[index], ...data };
    }
    setTimeout(() => resolve(clientsStore[index]), 200);
  }),
  remove: async (id: string) => new Promise<void>(resolve => {
    clientsStore = clientsStore.filter(c => c.id !== id);
    setTimeout(() => resolve(), 200);
  })
};
