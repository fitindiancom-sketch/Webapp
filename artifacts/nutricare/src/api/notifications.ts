import { Notification } from "../types";

let notificationsStore: Notification[] = [];

export const notificationsApi = {
  list: async () => [...notificationsStore],
  get: async (id: string) => notificationsStore.find(n => n.id === id),
  create: async (data: Omit<Notification, "id">) => {
    const newNotification = { ...data, id: `n${Date.now()}` };
    notificationsStore.push(newNotification);
    return newNotification;
  },
  update: async (id: string, data: Partial<Notification>) => {
    const index = notificationsStore.findIndex(n => n.id === id);
    if (index > -1) notificationsStore[index] = { ...notificationsStore[index], ...data };
    return notificationsStore[index];
  },
  remove: async (id: string) => {
    notificationsStore = notificationsStore.filter(n => n.id !== id);
  },
  markAllRead: async () => {
    notificationsStore = notificationsStore.map(n => ({ ...n, read: true }));
  }
};
