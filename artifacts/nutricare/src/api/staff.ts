import { apiFetch } from "../lib/queryClient";
import { Staff } from "../types";

function mapRow(row: any): Staff {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email ?? "",
    mobile: row.phone ?? "",
    status: row.status === "active" ? "Active" : "Inactive",
    department: row.supportChannel ?? row.role ?? "",
    joinDate: row.createdAt ?? "",
    avatar: row.avatarUrl ?? "",
  };
}

export const staffApi = {
  list: async (): Promise<Staff[]> => {
    const rows = await apiFetch<any[]>("/api/staff");
    return rows.map(mapRow);
  },
  get: async (id: string): Promise<Staff | undefined> => {
    try {
      const row = await apiFetch<any>(`/api/staff/${id}`);
      return mapRow(row);
    } catch { return undefined; }
  },
  create: async (data: Omit<Staff, "id">): Promise<Staff> => {
    const row = await apiFetch<any>("/api/staff", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.mobile,
       role: data.role?.toLowerCase().replace(" ", "_"),
        status: data.status?.toLowerCase() ?? "active",
       supportChannel: data.department ? data.department.toLowerCase().replace(" ", "_") : undefined,
        avatarUrl: data.avatar || undefined,
      }),
    });
    return mapRow(row);
  },
  update: async (id: string, data: Partial<Staff>): Promise<Staff> => {
    const row = await apiFetch<any>(`/api/staff/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.mobile,
       role: data.role?.toLowerCase().replace(" ", "_"),
        status: data.status?.toLowerCase(),
        supportChannel: data.department || undefined,
        avatarUrl: data.avatar || undefined,
      }),
    });
    return mapRow(row);
  },
  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/staff/${id}`, { method: "DELETE" });
  },
};
