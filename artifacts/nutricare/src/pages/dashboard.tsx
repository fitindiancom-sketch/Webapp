import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Activity, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
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

const revenueData = [
  { name: 'Jan', value: 300000 },
  { name: 'Feb', value: 350000 },
  { name: 'Mar', value: 320000 },
  { name: 'Apr', value: 400000 },
  { name: 'May', value: 380000 },
  { name: 'Jun', value: 450000 },
];

const registrationsData = [
  { name: 'Week 1', clients: 20 },
  { name: 'Week 2', clients: 35 },
  { name: 'Week 3', clients: 25 },
  { name: 'Week 4', clients: 40 },
];

function KpiCard({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: any, trend?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { kpis } = MOCK_DATA;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="flex gap-2 bg-card p-2 rounded-lg border shadow-sm">
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none px-2 py-1"><option>This Month</option></select>
          <div className="w-px h-6 bg-border mx-2 self-center"></div>
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none px-2 py-1"><option>All Dietitians</option></select>
          <div className="w-px h-6 bg-border mx-2 self-center"></div>
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none px-2 py-1"><option>Online + Visit</option></select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard title="Total Clients" value={kpis.totalClients} icon={Users} trend="+12% from last month" />
          <KpiCard title="Active Clients" value={kpis.activeClients} icon={Activity} />
          <KpiCard title="Revenue (₹)" value={`₹${kpis.revenueMonth.toLocaleString()}`} icon={TrendingUp} trend="+5% from last month" />
          <KpiCard title="Pending Followups" value={kpis.pendingFollowups} icon={CalendarIcon} />
          <KpiCard title="Success Rate" value={`${kpis.weightLossSuccessPercent}%`} icon={Activity} />
          <KpiCard title="Near Renewal" value={kpis.nearRenewal} icon={Users} />
          <KpiCard title="Today Registrations" value={kpis.todayRegistrations} icon={Users} />
          <KpiCard title="No Response" value={kpis.noResponse} icon={Activity} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Registrations</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="clients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
