import { Appointment } from "../types";

let appointmentsStore: Appointment[] = [];

export const appointmentsApi = {
  list: async () => [...appointmentsStore],
  get: async (id: string) => appointmentsStore.find(a => a.id === id),
  create: async (data: Omit<Appointment, "id">) => {
    const newAppointment = { ...data, id: `a${Date.now()}` };
    appointmentsStore.push(newAppointment);
    return newAppointment;
  },
  update: async (id: string, data: Partial<Appointment>) => {
    const index = appointmentsStore.findIndex(a => a.id === id);
    if (index > -1) appointmentsStore[index] = { ...appointmentsStore[index], ...data };
    return appointmentsStore[index];
  },
  remove: async (id: string) => {
    appointmentsStore = appointmentsStore.filter(a => a.id !== id);
  }
};
