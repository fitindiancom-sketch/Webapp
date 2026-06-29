import { apiFetch } from "../lib/queryClient";
import { Staff } from "../types";

function mapRow(row: any): Staff {
  return {
    id: row.id,
    name: `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || row.email,
    role: row.role ?? "admin",
    email: row.email ?? "",
    mobile: row.phone ?? "",
    status: row.isActive === false ? "Inactive" : "Active",
    department: row.role ?? "",
    joinDate: row.createdAt ? row.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    avatar: row.profileImageUrl ?? "",
  };
}

export const staffApi = {
  list: async (): Promise<Staff[]> => {
    const rows = await apiFetch<any[]>("/api/admin/staff");
    return rows.map(mapRow);
  },
  get: async (id: string): Promise<Staff | undefined> => {
    try {
      const rows = await apiFetch<any[]>("/api/admin/staff");
      const row = rows.find((r: any) => r.id === id);
      return row ? mapRow(row) : undefined;
    } catch { return undefined; }
  },
  create: async (data: any): Promise<Staff> => {
    const row = await apiFetch<any>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password ?? "NutriCare@123",
        firstName: data.name?.split(" ")[0],
        lastName: data.name?.split(" ").slice(1).join(" ") || undefined,
        role: data.role?.toLowerCase().replace(/ /g, "_"),
        phone: data.mobile,
      }),
    });
    return mapRow(row);
  },
  update: async (id: string, data: Partial<Staff>): Promise<Staff> => {
    const row = await apiFetch<any>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        firstName: data.name?.split(" ")[0],
        lastName: data.name?.split(" ").slice(1).join(" ") || undefined,
        role: data.role?.toLowerCase().replace(/ /g, "_"),
        phone: data.mobile,
        isActive: data.status === "Active",
      }),
    });
    return mapRow(row);
  },
  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/admin/users/${id}`, { method: "DELETE" });
  },
};
