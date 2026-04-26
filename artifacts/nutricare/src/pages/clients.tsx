import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clients as seedClients, staff } from "../mock/data";
import { LIFECYCLE_LABELS, LifecycleStatus, Client } from "../types";
import { useDietPlanStore } from "../store/dietPlans";
import { Filter, Search, X } from "lucide-react";
import { toast } from "sonner";

const FILTER_TABS: Array<{ key: "all" | LifecycleStatus | "online" | "visit"; label: string }> = [
  { key: "all", label: "All Clients" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "plan_not_started", label: "Plan Not Started" },
  { key: "completed_30_days", label: "30 Days Completed" },
  { key: "few_days_then_stopped", label: "Followed Few Days" },
  { key: "not_following_no_response", label: "Not Responding" },
  { key: "renewal_due", label: "Renewal Due" },
  { key: "online", label: "Online Clients" },
  { key: "visit", label: "Visit Clients" },
];

const STATUS_BADGE: Record<LifecycleStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  completed_30_days: "bg-teal-100 text-teal-700 hover:bg-teal-100",
  plan_not_started: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  few_days_then_stopped: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  not_following_no_response: "bg-red-100 text-red-700 hover:bg-red-100",
  renewal_due: "bg-violet-100 text-violet-700 hover:bg-violet-100",
  inactive: "bg-gray-200 text-gray-700 hover:bg-gray-200",
};

export default function Clients() {
  const [allClients, setAllClients] = React.useState<Client[]>(seedClients);
  const [activeTab, setActiveTab] = React.useState<typeof FILTER_TABS[number]["key"]>("all");
  const [search, setSearch] = React.useState("");
  const [dietitianFilter, setDietitianFilter] = React.useState<string>("all");
  const [cityFilter, setCityFilter] = React.useState<string>("all");
  const [planFilter, setPlanFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");

  const { plans } = useDietPlanStore();

  // form state
  const [form, setForm] = React.useState({
    name: "", mobile: "", email: "", city: "",
    dietitianId: "s1", supportStaffId: "s2",
    registrationType: "Online" as "Online" | "Visit",
    planType: "Standard" as "Basic" | "Standard" | "Premium" | "VIP",
  });

  const dietitians = staff.filter((s) => s.role === "Dietitian");
  const cities = Array.from(new Set(allClients.map((c) => c.city)));

  const filteredClients = React.useMemo(() => {
    return allClients.filter((c) => {
      // tab filter
      if (activeTab !== "all") {
        if (activeTab === "online" && c.registrationType !== "Online") return false;
        if (activeTab === "visit" && c.registrationType !== "Visit") return false;
        if (
          activeTab !== "online" &&
          activeTab !== "visit" &&
          c.lifecycleStatus !== activeTab
        )
          return false;
      }
      // search
      if (search) {
        const q = search.toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.mobile.toLowerCase().includes(q) ||
          c.clientId.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (dietitianFilter !== "all" && c.dietitianId !== dietitianFilter) return false;
      if (cityFilter !== "all" && c.city !== cityFilter) return false;
      if (planFilter !== "all" && c.planType !== planFilter) return false;
      if (dateFilter !== "all" && c.registrationDate) {
        const days = Math.ceil(
          (new Date().getTime() - new Date(c.registrationDate).getTime()) / 86400000
        );
        if (dateFilter === "7" && days > 7) return false;
        if (dateFilter === "30" && days > 30) return false;
        if (dateFilter === "90" && days > 90) return false;
      }
      return true;
    });
  }, [allClients, activeTab, search, dietitianFilter, cityFilter, planFilter, dateFilter]);

  // Merge in latest plan info from the diet plan store
  const enrichedClients = React.useMemo(() => {
    return filteredClients.map((c) => {
      const latest = plans.find((p) => p.clientId === c.id && p.status === "Published");
      if (latest) {
        return { ...c, latestPlanId: latest.id, latestPlanDate: latest.createdAt.slice(0, 10) };
      }
      return c;
    });
  }, [filteredClients, plans]);

  const resetFilters = () => {
    setActiveTab("all"); setSearch(""); setDietitianFilter("all");
    setCityFilter("all"); setPlanFilter("all"); setDateFilter("all");
  };

  const handleAddClient = () => {
    if (!form.name || !form.mobile || !form.city) {
      toast.error("Please fill name, mobile, and city");
      return;
    }
    const nextNum = 10000 + allClients.length + 1;
    const newClient: Client = {
      id: `c${Date.now()}`,
      clientId: `NC-${nextNum}`,
      name: form.name,
      mobile: form.mobile,
      email: form.email || undefined,
      city: form.city,
      dietitianId: form.dietitianId,
      supportStaffId: form.supportStaffId,
      status: "Active",
      lifecycleStatus: "plan_not_started",
      registrationType: form.registrationType,
      planType: form.planType,
      progressPercent: 0,
      lastUpdate: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      registrationDate: new Date().toISOString().slice(0, 10),
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };
    setAllClients((prev) => [newClient, ...prev]);
    setForm({ ...form, name: "", mobile: "", email: "", city: "" });
    toast.success(`Client ${newClient.clientId} added successfully`);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
            <p className="text-sm text-muted-foreground">
              {enrichedClients.length} of {allClients.length} clients
            </p>
          </div>
          <Button onClick={() => document.getElementById("add-tab-trigger")?.click()}>
            Add New Client
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Clients</TabsTrigger>
            <TabsTrigger value="add" id="add-tab-trigger">Add Client</TabsTrigger>
            <TabsTrigger value="credentials">Login Credentials</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground hover:bg-muted border-border"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search + dropdown filters */}
            <Card className="p-3">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, mobile, or client ID"
                    className="pl-8"
                  />
                </div>
                <Select value={dietitianFilter} onValueChange={setDietitianFilter}>
                  <SelectTrigger className="w-[170px]"><SelectValue placeholder="Dietitian" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dietitians</SelectItem>
                    {dietitians.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Plan Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Date Range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>
            </Card>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Latest Plan</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No clients match the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrichedClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.clientId}</TableCell>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.mobile}</TableCell>
                        <TableCell>{client.city}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{client.registrationType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_BADGE[client.lifecycleStatus]} font-medium`}>
                            {LIFECYCLE_LABELS[client.lifecycleStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {client.latestPlanId ? (
                            <div>
                              <div className="font-medium">{client.latestPlanId}</div>
                              <div className="text-muted-foreground">{client.latestPlanDate}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No plan yet</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${client.progressPercent}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{client.progressPercent}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Client</CardTitle>
                <CardDescription>Enter client details to register them in the system.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile *</label>
                    <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City *</label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Mumbai" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assigned Dietitian</label>
                    <Select value={form.dietitianId} onValueChange={(v) => setForm({ ...form, dietitianId: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {dietitians.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Registration Type</label>
                    <Select value={form.registrationType} onValueChange={(v: "Online" | "Visit") => setForm({ ...form, registrationType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Visit">Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plan Type</label>
                    <Select value={form.planType} onValueChange={(v: any) => setForm({ ...form, planType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-6" onClick={handleAddClient}>Save Client</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-10">
                  Login Credentials view
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
