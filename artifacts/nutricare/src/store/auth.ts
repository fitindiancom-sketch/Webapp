import { create } from "zustand";
import { User, Role } from "../types";

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const DEMO_USER: User = {
  id: "u1",
  name: "Dr. Aditi Sharma",
  email: "aditi@nutricare.com",
  role: "Super Admin",
  avatar: "https://i.pravatar.cc/150?u=aditi",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USER,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  switchRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),
}));
