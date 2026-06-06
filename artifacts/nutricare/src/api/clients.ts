import { apiFetch } from "../lib/queryClient";
import { Client } from "../types";

// Maps database row from backend to frontend Client type
function mapRow(row: any): Client {
  return {
    id: row.id,
    clientId: row.clientCode ?? row.id,
    name: row.name,
    mobile: row.phone ?? "",
    email: row.email ?? "",
    city: row.city ?? "",
    dietitianId: row.assignedDietitianId ?? "",
    supportStaffId: row.assignedSupportId ?? "",
    status: mapStatus(row.status),
    lifecycleStatus: row.status ?? "plan_not_started",
    registrationType: mapRegistrationType(row.registrationType),
    progressPercent: 0,
    lastUpdate: row.updatedAt ?? row.createdAt ?? "",
    renewalDate: row.planEndDate ?? "",
    registrationDate: row.createdAt ?? "",
    planStartDate: row.planStartDate ?? "",
    planEndDate: row.planEndDate ?? "",
    lastActivityDate: row.lastActivityDate ?? "",
    avatar: row.avatarUrl ?? "",
  };
}

function mapStatus(s: string): Client["status"] {
  if (s === "active") return "Active";
  if (s === "inactive") return "Inactive";
  if (s === "renewal_due") return "Renewal Due";
  if (s === "not_following_no_response") return "No Response";
  return "Active";
}

function mapRegistrationType(s: string): Client["registrationType"] {
  if (s === "visit") return "Visit";
  if (s === "pune_visit") return "Pune Visit";
  return "Online";
}

export const clientsApi = {
  list: async (): Promise<Client[]> => {
    const rows = await apiFetch<any[]>("/api/clients");
    return rows.map(mapRow);
  },
  get: async (id: string): Promise<Client | undefined> => {
    try {
      const row = await apiFetch<any>(`/api/clients/${id}`);
      return mapRow(row);
    } catch {
      return undefined;
    }
  },
  create: async (data: Omit<Client, "id">): Promise<Client> => {
    const row = await apiFetch<any>("/api/clients", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        phone: data.mobile,
        email: data.email,
        city: data.city,
        registrationType: data.registrationType?.toLowerCase().replace(" ", "_"),
        assignedDietitianId: data.dietitianId || undefined,
        assignedSupportId: data.supportStaffId || undefined,
        planStartDate: data.planStartDate || undefined,
        planEndDate: data.planEndDate || undefined,
      }),
    });
    return mapRow(row);
  },
  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    const row = await apiFetch<any>(`/api/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: data.name,
        phone: data.mobile,
        email: data.email,
        city: data.city,
        status: data.lifecycleStatus,
        planStartDate: data.planStartDate || undefined,
        planEndDate: data.planEndDate || undefined,
        lastActivityDate: data.lastActivityDate || undefined,
      }),
    });
    return mapRow(row);
  },
  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/clients/${id}`, { method: "DELETE" });
  },
};
