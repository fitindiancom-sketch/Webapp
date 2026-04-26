export type Role = "Super Admin" | "Admin" | "Dietitian" | "Online Support" | "Visit Support";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Client {
  id: string;
  clientId: string;
  name: string;
  mobile: string;
  city: string;
  dietitianId: string;
  supportStaffId: string;
  status: "Active" | "Inactive" | "No Response" | "Renewal Due";
  registrationType: "Online" | "Visit";
  progressPercent: number;
  lastUpdate: string;
  renewalDate: string;
  avatar?: string;
}

export interface DashboardData {
  kpis: {
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    todayRegistrations: number;
    onlineToday: number;
    visitToday: number;
    nearRenewal: number;
    nearDueDietPlans: number;
    startedPlan: number;
    notStartedPlan: number;
    noResponse: number;
    completed30Day: number;
    weightLossSuccessPercent: number;
    revenueMonth: number;
    pendingFollowups: number;
  };
}

export interface Staff {
  id: string;
  name: string;
  role: Role;
  email: string;
  mobile: string;
  status: "Active" | "Inactive";
  department: string;
  joinDate: string;
  avatar?: string;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  planType: "Basic" | "Standard" | "Premium" | "VIP";
  paidDate: string;
  renewalDate: string;
  status: "Paid" | "Pending" | "Partial" | "Renewal Due" | "Expired";
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  clientId: string;
  dietitianId: string;
  type: "Online" | "Visit";
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

export interface ProgressEntry {
  id: string;
  clientId: string;
  date: string;
  weight: number;
  waist: number;
  hip: number;
  chest: number;
  arm: number;
  notes?: string;
  mealCompliance: number;
}

export interface Photo {
  id: string;
  clientId: string;
  date: string;
  mealType: "Breakfast" | "Lunch" | "Dinner";
  photoUrl: string;
  uploadedBy: string;
  remarks?: string;
}

export interface Notification {
  id: string;
  type: "renewal_reminder" | "no_response" | "appointment_reminder" | "new_registration" | "progress_milestone";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface DietPlan {
  id: string;
  clientId: string;
  dietitianId: string;
  category: "New" | "Active" | "Renewal";
  mustDo: string[];
  waterGoal: number;
  meals: {
    mealType: string;
    items: string[];
  }[];
  createdAt: string;
  status: "Draft" | "Published";
}
