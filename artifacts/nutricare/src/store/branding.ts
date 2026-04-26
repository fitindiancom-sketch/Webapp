import { create } from "zustand";

interface BrandingState {
  clinicName: string;
  tagline: string;
  primaryColor: string;
  updateBranding: (data: Partial<Omit<BrandingState, "updateBranding">>) => void;
}

export const useBrandingStore = create<BrandingState>((set) => ({
  clinicName: "NutriCare Clinic",
  tagline: "Healthy Living",
  primaryColor: "160 84% 39%",
  updateBranding: (data) => set((state) => ({ ...state, ...data })),
}));
