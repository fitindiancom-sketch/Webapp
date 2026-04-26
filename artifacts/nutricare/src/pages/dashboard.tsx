import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, Activity, TrendingUp, Calendar as CalendarIcon, AlertCircle, CheckCircle2,
  PauseCircle, UserPlus, UserCheck, ClockAlert, ClipboardList, Award, PhoneOff, PlayCircle
} from "lucide-react";
import { clients } from "../mock/data";
import { LIFECYCLE_LABELS, LifecycleStatus } from "../types";

const today = new Date();
const inDays = (dateStr: string) => {
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
const isToday = (dateStr?: string) => {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === today.toDateString();
};

function computeKpis() {
  const byStatus = (s: LifecycleStatus) => clients.filter((c) => c.lifecycleStatus === s).length;
  const renewalIn = (n: number) =>
    clients.filter((c) => {
      const days = inDays(c.renewalDate);
      return days >= 0 && days <= n;
    }).length;

  return {
    planNotStarted: byStatus("plan_not_started"),
    completed30Days: byStatus("completed_30_days"),
    fewDaysStopped: byStatus("few_days_then_stopped"),
    notFollowing: byStatus("not_following_no_response"),
    active: byStatus("active") + byStatus("completed_30_days"),
    inactive: byStatus("inactive"),
    renewalDue: byStatus("renewal_due"),
    renewal3: renewalIn(3),
    renewal5: renewalIn(5),
    renewal7: renewalIn(7),
    todayOnline: clients.filter((c) => c.registrationType === "Online" && isToday(c.registrationDate)).length,
    todayVisit: clients.filter((c) => c.registrationType === "Visit" && isToday(c.registrationDate)).length,
    pendingFollowups: clients.filter((c) =>
      c.lifecycleStatus === "few_days_then_stopped" || c.lifecycleStatus === "not_following_no_response"
    ).length,
    dietPlanDueToday: clients.filter((c) =>
      c.lifecycleStatus === "plan_not_started" || (c.latestPlanDate && inDays(c.latestPlanDate) <= -28)
    ).length,
    weightLossSuccess: clients.filter((c) => c.progressPercent >= 70).length,
    totalRevenue: 450000,
  };
}

const revenueData = [
  { name: 'Nov', value: 300000 },
  { name: 'Dec', value: 350000 },
  { name: 'Jan', value: 320000 },
  { name: 'Feb', value: 400000 },
  { name: 'Mar', value: 380000 },
  { name: 'Apr', value: 450000 },
];

const registrationsData = [
  { name: 'Week 1', clients: 20 },
  { name: 'Week 2', clients: 35 },
  { name: 'Week 3', clients: 25 },
  { name: 'Week 4', clients: 40 },
];

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  completed_30_days: "#0d9488",
  plan_not_started: "#f59e0b",
  few_days_then_stopped: "#f97316",
  not_following_no_response: "#ef4444",
  renewal_due: "#8b5cf6",
  inactive: "#6b7280",
};

function KpiCard({
  title, value, icon: Icon, accent, trend
}: {
  title: string; value: string | number; icon: any; accent: string; trend?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const kpis = React.useMemo(() => computeKpis(), []);

  const statusBreakdown = React.useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => {
      map[c.lifecycleStatus] = (map[c.lifecycleStatus] || 0) + 1;
    });
    return Object.entries(map).map(([k, v]) => ({
      name: LIFECYCLE_LABELS[k as LifecycleStatus],
      value: v,
      key: k,
    }));
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2 bg-card p-2 rounded-lg border shadow-sm">
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none px-2 py-1">
            <option>This Month</option><option>This Week</option><option>Today</option>
          </select>
          <div className="w-px h-6 bg-border mx-2 self-center"></div>
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none px-2 py-1">
            <option>All Dietitians</option><option>Dr. Aditi Sharma</option><option>Dr. Kavita Desai</option>
          </select>
          <div className="w-px h-6 bg-border mx-2 self-center"></div>
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none px-2 py-1">
            <option>Online + Visit</option><option>Online Only</option><option>Visit Only</option>
          </select>
        </div>

        {/* Lifecycle KPI grid */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Client Lifecycle</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <KpiCard title="Plan Not Started" value={kpis.planNotStarted} icon={PauseCircle} accent="bg-amber-100 text-amber-700" />
            <KpiCard title="30 Days Completed" value={kpis.completed30Days} icon={CheckCircle2} accent="bg-teal-100 text-teal-700" />
            <KpiCard title="Followed Few Days" value={kpis.fewDaysStopped} icon={PlayCircle} accent="bg-orange-100 text-orange-700" />
            <KpiCard title="Not Responding" value={kpis.notFollowing} icon={PhoneOff} accent="bg-red-100 text-red-700" />
            <KpiCard title="Active Clients" value={kpis.active} icon={Activity} accent="bg-emerald-100 text-emerald-700" />
            <KpiCard title="Inactive Clients" value={kpis.inactive} icon={Users} accent="bg-gray-100 text-gray-700" />
            <KpiCard title="Renewal Due" value={kpis.renewalDue} icon={ClockAlert} accent="bg-violet-100 text-violet-700" />
            <KpiCard title="Pending Followups" value={kpis.pendingFollowups} icon={AlertCircle} accent="bg-rose-100 text-rose-700" />
          </div>
        </div>

        {/* Operational KPIs */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Today &amp; Renewals</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <KpiCard title="Renewal in 3 Days" value={kpis.renewal3} icon={CalendarIcon} accent="bg-violet-100 text-violet-700" />
            <KpiCard title="Renewal in 5 Days" value={kpis.renewal5} icon={CalendarIcon} accent="bg-violet-100 text-violet-700" />
            <KpiCard title="Renewal in 7 Days" value={kpis.renewal7} icon={CalendarIcon} accent="bg-violet-100 text-violet-700" />
            <KpiCard title="Diet Plan Due Today" value={kpis.dietPlanDueToday} icon={ClipboardList} accent="bg-sky-100 text-sky-700" />
            <KpiCard title="Today New Online" value={kpis.todayOnline} icon={UserPlus} accent="bg-emerald-100 text-emerald-700" />
            <KpiCard title="Today New Visit" value={kpis.todayVisit} icon={UserCheck} accent="bg-emerald-100 text-emerald-700" />
            <KpiCard title="Weight Loss Success" value={kpis.weightLossSuccess} icon={Award} accent="bg-amber-100 text-amber-700" />
            <KpiCard title="Revenue (Month)" value={`₹${kpis.totalRevenue.toLocaleString()}`} icon={TrendingUp} accent="bg-emerald-100 text-emerald-700" trend="+5% from last month" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Client Status Breakdown</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Registrations</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
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
