import React from "react";
import { useLocation } from "wouter";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { staff } from "../mock/data";
import { LIFECYCLE_LABELS, LifecycleStatus, Client } from "../types";
import { useDietPlanStore } from "../store/dietPlans";
import { useClientsStore } from "../store/clients";
import { enrichClient } from "../lib/clientStatus";
import { Filter, Search, X, FileText, UserPlus, CheckCircle2 } from "lucide-react";
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

const EMPTY_FORM = {
  name: "",
  mobile: "",
  email: "",
  city: "",
  dietitianId: "s1",
  supportStaffId: "s2",
  registrationType: "Online" as "Online" | "Visit" | "Pune Visit",
  planType: "Standard" as "Basic" | "Standard" | "Premium" | "VIP",
};

export default function Clients() {
  const [, setLocation] = useLocation();
  const rawClients = useClientsStore((s) => s.clients);
  const addClientToStore = useClientsStore((s) => s.addClient);
  const { plans } = useDietPlanStore();

  const allClients = React.useMemo(
    () => rawClients.map((c) => enrichClient(c, plans)),
    [rawClients, plans]
  );

  const [activeTab, setActiveTab] = React.useState<typeof FILTER_TABS[number]["key"]>("all");
  const [search, setSearch] = React.useState("");
  const [dietitianFilter, setDietitianFilter] = React.useState<string>("all");
  const [cityFilter, setCityFilter] = React.useState<string>("all");
  const [planFilter, setPlanFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");

  // Add Client dialog state
  const [addOpen, setAddOpen] = React.useState(false);
  const [phase, setPhase] = React.useState<"form" | "success">("form");
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [justAdded, setJustAdded] = React.useState<Client | null>(null);

  const dietitians = staff.filter((s) => s.role === "Dietitian");
  const cities = Array.from(new Set(allClients.map((c) => c.city)));

  const filteredClients = React.useMemo(() => {
    return allClients.filter((c) => {
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

  const enrichedClients = filteredClients;

  const resetFilters = () => {
    setActiveTab("all");
    setSearch("");
    setDietitianFilter("all");
    setCityFilter("all");
    setPlanFilter("all");
    setDateFilter("all");
  };

  const openAddDialog = () => {
    setForm(EMPTY_FORM);
    setPhase("form");
    setJustAdded(null);
    setAddOpen(true);
  };

  const handleSaveClient = () => {
    if (!form.name.trim() || !form.mobile.trim() || !form.city.trim()) {
      toast.error("Please fill name, mobile, and city");
      return;
    }
    const nextNum = 10000 + allClients.length + 1;
    const todayIso = new Date().toISOString().slice(0, 10);
    const newClient: Client = {
      id: `c${Date.now()}`,
      clientId: `NC-${nextNum}`,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      city: form.city.trim(),
      dietitianId: form.dietitianId,
      supportStaffId: form.supportStaffId,
      status: "Active",
      lifecycleStatus: "plan_not_started",
      registrationType: form.registrationType,
      planType: form.planType,
      progressPercent: 0,
      lastUpdate: todayIso,
      lastActivityDate: todayIso,
      renewalDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      registrationDate: todayIso,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };
    addClientToStore(newClient);
    setJustAdded(newClient);
    setPhase("success");
    toast.success("Client Registered Successfully");
  };

  const goCreatePlanFor = (client: Client) => {
    setAddOpen(false);
    setLocation(`/diet-plans?clientId=${encodeURIComponent(client.id)}`);
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
          <Button onClick={openAddDialog}>
            <UserPlus className="h-4 w-4 mr-1.5" /> Add New Client
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Clients</TabsTrigger>
            <TabsTrigger value="credentials">Login Credentials</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
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
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => goCreatePlanFor(client)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" /> Create Plan
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7">View</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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

      {/* Add Client Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          {phase === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                  Add New Client
                </DialogTitle>
                <DialogDescription>
                  Enter client details to register them in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile *</label>
                  <Input
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="priya@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                  />
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
                  <Select
                    value={form.registrationType}
                    onValueChange={(v: "Online" | "Visit" | "Pune Visit") => setForm({ ...form, registrationType: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Visit">Visit</SelectItem>
                      <SelectItem value="Pune Visit">Pune Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveClient}>
                  <UserPlus className="h-4 w-4 mr-1.5" /> Register Client
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Client Registered Successfully
                </DialogTitle>
                <DialogDescription>
                  The new client has been added to your database.
                </DialogDescription>
              </DialogHeader>
              {justAdded && (
                <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 my-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={justAdded.avatar}
                      alt={justAdded.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-emerald-900">{justAdded.name}</div>
                      <div className="text-xs text-emerald-700">
                        {justAdded.clientId} · {justAdded.mobile} · {justAdded.city}
                      </div>
                      <div className="text-xs text-emerald-700 mt-0.5">
                        {justAdded.registrationType} · {justAdded.planType} plan
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={openAddDialog}>
                  <UserPlus className="h-4 w-4 mr-1.5" /> Add Another
                </Button>
                <Button
                  onClick={() => justAdded && goCreatePlanFor(justAdded)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <FileText className="h-4 w-4 mr-1.5" /> Create Diet Plan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
