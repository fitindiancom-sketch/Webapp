import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Client } from "../types";
import { clients as seedClients } from "../mock/data";

interface ClientsStore {
  clients: Client[];
  addClient: (c: Client) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;
  /** Called when a diet plan is published — sets plan window + activity timestamp */
  attachPlan: (clientId: string, planStartDate: string, planEndDate: string) => void;
  /** Reset to the seed mock data (handy for demo). */
  resetToSeed: () => void;
}

export const useClientsStore = create<ClientsStore>()(
  persist(
    (set) => ({
      clients: seedClients,
      addClient: (c) => set((s) => ({ clients: [c, ...s.clients] })),
      updateClient: (id, patch) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),
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
      resetToSeed: () => set({ clients: seedClients }),
    }),
    { name: "nutricare-clients", version: 1 }
  )
);
