import { useClientsStore } from "../store/clients";
import { Client } from "../types";

// Thin async wrapper around the persisted Zustand store so the call sites
// (which were written against a REST-shaped contract) keep working.
// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const clientsApi = {
  list: async () => delay(useClientsStore.getState().clients),
  get: async (id: string) =>
    delay(useClientsStore.getState().clients.find((c) => c.id === id)),
  create: async (data: Omit<Client, "id">) => {
    const newClient: Client = { ...data, id: `c${Date.now()}` };
    useClientsStore.getState().addClient(newClient);
    return delay(newClient);
  },
  update: async (id: string, data: Partial<Client>) => {
    useClientsStore.getState().updateClient(id, data);
    const updated = useClientsStore.getState().clients.find((c) => c.id === id) as Client;
    return delay(updated);
  },
  remove: async (id: string) => {
    useClientsStore.getState().removeClient(id);
    return delay(undefined as void);
  },
};
