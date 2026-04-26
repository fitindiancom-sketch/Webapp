import { create } from "zustand";

interface PermissionsState {
  matrix: Record<string, Record<string, boolean>>;
  updatePermission: (role: string, permission: string, value: boolean) => void;
}

const defaultMatrix = {
  "Dietitian": { viewClients: true, editClients: true, makeDietPlan: true, viewPayments: false, viewReports: true, manageStaff: false },
  "Online Support": { viewClients: true, editClients: false, makeDietPlan: false, viewPayments: false, viewReports: false, manageStaff: false },
  "Visit Support": { viewClients: true, editClients: false, makeDietPlan: false, viewPayments: true, viewReports: false, manageStaff: false },
  "Admin": { viewClients: true, editClients: true, makeDietPlan: true, viewPayments: true, viewReports: true, manageStaff: true },
};

export const usePermissionsStore = create<PermissionsState>((set) => ({
  matrix: defaultMatrix,
  updatePermission: (role, permission, value) => set((state) => ({
    matrix: {
      ...state.matrix,
      [role]: {
        ...(state.matrix[role] || {}),
        [permission]: value
      }
    }
  }))
}));
