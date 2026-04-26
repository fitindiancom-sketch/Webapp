import { photos as initialPhotos } from "../mock/data";
import { Photo } from "../types";

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
let photosStore = [...initialPhotos];

export const photosApi = {
  list: async (clientId?: string) => new Promise<Photo[]>(resolve => setTimeout(() => resolve(clientId ? photosStore.filter(p => p.clientId === clientId) : photosStore), 200)),
  get: async (id: string) => new Promise<Photo | undefined>(resolve => setTimeout(() => resolve(photosStore.find(p => p.id === id)), 200)),
  create: async (data: Omit<Photo, "id">) => new Promise<Photo>(resolve => {
    const newPhoto = { ...data, id: `ph${Date.now()}` };
    photosStore.push(newPhoto);
    setTimeout(() => resolve(newPhoto), 200);
  }),
  update: async (id: string, data: Partial<Photo>) => new Promise<Photo>(resolve => {
    const index = photosStore.findIndex(p => p.id === id);
    if (index > -1) {
      photosStore[index] = { ...photosStore[index], ...data };
    }
    setTimeout(() => resolve(photosStore[index]), 200);
  }),
  remove: async (id: string) => new Promise<void>(resolve => {
    photosStore = photosStore.filter(p => p.id !== id);
    setTimeout(() => resolve(), 200);
  })
};
