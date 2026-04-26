import { notifications as initialNotifications } from "../mock/data";
import { Notification } from "../types";

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
let notificationsStore = [...initialNotifications];

export const notificationsApi = {
  list: async () => new Promise<Notification[]>(resolve => setTimeout(() => resolve([...notificationsStore].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())), 200)),
  get: async (id: string) => new Promise<Notification | undefined>(resolve => setTimeout(() => resolve(notificationsStore.find(n => n.id === id)), 200)),
  create: async (data: Omit<Notification, "id">) => new Promise<Notification>(resolve => {
    const newNotification = { ...data, id: `n${Date.now()}` };
    notificationsStore.push(newNotification);
    setTimeout(() => resolve(newNotification), 200);
  }),
  update: async (id: string, data: Partial<Notification>) => new Promise<Notification>(resolve => {
    const index = notificationsStore.findIndex(n => n.id === id);
    if (index > -1) {
      notificationsStore[index] = { ...notificationsStore[index], ...data };
    }
    setTimeout(() => resolve(notificationsStore[index]), 200);
  }),
  markAllAsRead: async () => new Promise<void>(resolve => {
    notificationsStore = notificationsStore.map(n => ({ ...n, read: true }));
    setTimeout(() => resolve(), 200);
  }),
  remove: async (id: string) => new Promise<void>(resolve => {
    notificationsStore = notificationsStore.filter(n => n.id !== id);
    setTimeout(() => resolve(), 200);
  })
};
