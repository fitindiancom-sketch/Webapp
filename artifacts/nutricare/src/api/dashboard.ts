import { DashboardData } from "../types";

const MOCK_DATA: DashboardData = {
  kpis: {
    totalClients: 245,
    activeClients: 180,
    inactiveClients: 65,
    todayRegistrations: 12,
    onlineToday: 8,
    visitToday: 4,
    nearRenewal: 24,
    nearDueDietPlans: 15,
    startedPlan: 150,
    notStartedPlan: 30,
    noResponse: 8,
    completed30Day: 45,
    weightLossSuccessPercent: 88,
    revenueMonth: 450000,
    pendingFollowups: 18
  }
};

// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
export const dashboardApi = {
  get: async () => new Promise<DashboardData>(resolve => setTimeout(() => resolve(MOCK_DATA), 200))
};
