import { apiFetch } from "../lib/queryClient";
import { Payment } from "../types";

function mapRow(row: any): Payment {
  return {
    id: row.id,
    clientId: row.clientId,
    amount: parseFloat(row.amount ?? "0"),
    planType: "Basic",
    paidDate: row.paymentDate ?? "",
    renewalDate: row.renewalDueDate ?? "",
    status: mapStatus(row.status),
  };
}

function mapStatus(s: string): Payment["status"] {
  if (s === "paid") return "Paid";
  if (s === "pending") return "Pending";
  if (s === "partial") return "Partial";
  return "Paid";
}

export const paymentsApi = {
  list: async (clientId?: string): Promise<Payment[]> => {
    const url = clientId ? `/api/payments?clientId=${clientId}` : "/api/payments";
    const rows = await apiFetch<any[]>(url);
    return rows.map(mapRow);
  },
  get: async (id: string): Promise<Payment | undefined> => {
    try {
      const row = await apiFetch<any>(`/api/payments/${id}`);
      return mapRow(row);
    } catch { return undefined; }
  },
  create: async (data: Omit<Payment, "id">): Promise<Payment> => {
    const row = await apiFetch<any>("/api/payments", {
      method: "POST",
      body: JSON.stringify({
        clientId: data.clientId,
        amount: data.amount.toString(),
        paymentDate: data.paidDate,
        renewalDueDate: data.renewalDate,
        planDurationDays: 30,
        status: data.status?.toLowerCase() ?? "paid",
      }),
    });
    return mapRow(row);
  },
  update: async (id: string, data: Partial<Payment>): Promise<Payment> => {
    const row = await apiFetch<any>(`/api/payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        amount: data.amount?.toString(),
        paymentDate: data.paidDate,
        renewalDueDate: data.renewalDate,
        status: data.status?.toLowerCase(),
      }),
    });
    return mapRow(row);
  },
  remove: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/payments/${id}`, { method: "DELETE" });
  },
};
