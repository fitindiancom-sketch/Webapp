import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Client } from "../types";
import { clientsApi } from "../api/clients";

interface ClientsStore {
  clients: Client[];
  loaded: boolean;
  addClient: (c: Client) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;
  loadClients: () => Promise<void>;
  attachPlan: (clientId: string, planStartDate: string, planEndDate: string) => void;
  resetToSeed: () => void;
}

export const useClientsStore = create<ClientsStore>()(
  persist(
    (set, get) => ({
      clients: [],
      loaded: false,
      addClient: (c) => set((s) => ({ clients: [c, ...s.clients] })),
      updateClient: (id, patch) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),
      loadClients: async () => {
        try {
          const clients = await clientsApi.list();
          set({ clients, loaded: true });
        } catch (e) {
          console.error("Failed to load clients", e);
        }
      },
      attachPlan: (clientId, planStartDate, planEndDate) =>
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  planStartDate,
                  planEndDate,
                  renewalDate: planEndDate,
                  lastActivityDate: planStartDate,
                  lastUpdate: planStartDate,
                }
              : c
          ),
        })),
      resetToSeed: () => set({ clients: [], loaded: false }),
    }),
    { name: "nutricare-clients-v2", version: 1 }
  )
);
