import { appointments as initialAppointments } from "../mock/data";
import { Appointment } from "../types";

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
let appointmentsStore = [...initialAppointments];

export const appointmentsApi = {
  list: async () => new Promise<Appointment[]>(resolve => setTimeout(() => resolve(appointmentsStore), 200)),
  get: async (id: string) => new Promise<Appointment | undefined>(resolve => setTimeout(() => resolve(appointmentsStore.find(a => a.id === id)), 200)),
  create: async (data: Omit<Appointment, "id">) => new Promise<Appointment>(resolve => {
    const newAppointment = { ...data, id: `a${Date.now()}` };
    appointmentsStore.push(newAppointment);
    setTimeout(() => resolve(newAppointment), 200);
  }),
  update: async (id: string, data: Partial<Appointment>) => new Promise<Appointment>(resolve => {
    const index = appointmentsStore.findIndex(a => a.id === id);
    if (index > -1) {
      appointmentsStore[index] = { ...appointmentsStore[index], ...data };
    }
    setTimeout(() => resolve(appointmentsStore[index]), 200);
  }),
  remove: async (id: string) => new Promise<void>(resolve => {
    appointmentsStore = appointmentsStore.filter(a => a.id !== id);
    setTimeout(() => resolve(), 200);
  })
};
