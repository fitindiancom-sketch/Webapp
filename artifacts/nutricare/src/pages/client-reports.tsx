import React from "react";
import { Link } from "wouter";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { staff, photos as allPhotos, progressEntries as allProgress } from "../mock/data";
import { LIFECYCLE_LABELS, LifecycleStatus } from "../types";
import { useDietPlanStore } from "../store/dietPlans";
import { useClientsStore } from "../store/clients";
import { enrichClient } from "../lib/clientStatus";
import {
  ArrowLeft,
  Camera,
  Filter,
  ImageOff,
  LineChart,
  Search,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";

const FILTER_TABS: Array<{
  key: "all" | LifecycleStatus | "online" | "visit";
  label: string;
}> = [
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

function fmtDate(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export default function ClientReports() {
  const rawClients = useClientsStore((s) => s.clients);
  const { plans } = useDietPlanStore();

  const allClients = React.useMemo(
    () => rawClients.map((c) => enrichClient(c, plans)),
    [rawClients, plans]
  );

  const [activeTab, setActiveTab] =
    React.useState<typeof FILTER_TABS[number]["key"]>("active");
  const [search, setSearch] = React.useState("");
  const [dietitianFilter, setDietitianFilter] = React.useState<string>("all");
  const [cityFilter, setCityFilter] = React.useState<string>("all");
  const [planFilter, setPlanFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");

  const dietitians = staff.filter((s) => s.role === "Dietitian");
  const cities = Array.from(new Set(allClients.map((c) => c.city)));

  const filteredClients = React.useMemo(() => {
    return allClients.filter((c) => {
      if (activeTab !== "all") {
        if (activeTab === "online" && c.registrationType !== "Online")
          return false;
        if (activeTab === "visit" && c.registrationType !== "Visit")
          return false;
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
      if (dietitianFilter !== "all" && c.dietitianId !== dietitianFilter)
        return false;
      if (cityFilter !== "all" && c.city !== cityFilter) return false;
      if (planFilter !== "all" && c.planType !== planFilter) return false;
      if (dateFilter !== "all" && c.registrationDate) {
        const days = Math.ceil(
          (new Date().getTime() - new Date(c.registrationDate).getTime()) /
            86400000
        );
        if (dateFilter === "7" && days > 7) return false;
        if (dateFilter === "30" && days > 30) return false;
        if (dateFilter === "90" && days > 90) return false;
      }
      return true;
    });
  }, [
    allClients,
    activeTab,
    search,
    dietitianFilter,
    cityFilter,
    planFilter,
    dateFilter,
  ]);

  const photosByClient = React.useMemo(() => {
    const map = new Map<string, typeof allPhotos>();
    for (const p of allPhotos) {
      const list = map.get(p.clientId) ?? [];
      list.push(p);
      map.set(p.clientId, list);
    }
    return map;
  }, []);

  const progressByClient = React.useMemo(() => {
    const map = new Map<string, typeof allProgress>();
    for (const p of allProgress) {
      const list = map.get(p.clientId) ?? [];
      list.push(p);
      map.set(p.clientId, list);
    }
    return map;
  }, []);

  const resetFilters = () => {
    setActiveTab("active");
    setSearch("");
    setDietitianFilter("all");
    setCityFilter("all");
    setPlanFilter("all");
    setDateFilter("all");
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/clients">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-testid="button-back-to-clients"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Clients Reports & Data
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredClients.length} of {allClients.length} clients ·
                client-wise photos and progress reports
              </p>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                data-testid={`filter-pill-${tab.key}`}
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

        {/* Filter bar */}
        <Card className="p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, mobile, or client ID"
                className="pl-8"
                data-testid="input-search"
              />
            </div>
            <Select value={dietitianFilter} onValueChange={setDietitianFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Dietitian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dietitians</SelectItem>
                {dietitians.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
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

        {/* Client list with photos + reports */}
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No clients match the current filters
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Accordion type="multiple" className="w-full">
              {filteredClients.map((client) => {
                const clientPhotos =
                  photosByClient.get(client.id)?.slice().sort((a, b) =>
                    b.date.localeCompare(a.date)
                  ) ?? [];
                const clientProgress =
                  progressByClient.get(client.id)?.slice().sort((a, b) =>
                    b.date.localeCompare(a.date)
                  ) ?? [];
                const dietitian = staff.find((s) => s.id === client.dietitianId);

                return (
                  <AccordionItem
                    key={client.id}
                    value={client.id}
                    data-testid={`client-row-${client.id}`}
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {client.name}{" "}
                            <span className="text-xs text-muted-foreground font-normal">
                              · {client.clientId}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {client.city} · {client.mobile}
                            {dietitian ? ` · Dr. ${dietitian.name}` : ""}
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 mr-3">
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            {client.registrationType}
                          </Badge>
                          <Badge
                            className={`${
                              STATUS_BADGE[client.lifecycleStatus]
                            } font-medium`}
                          >
                            {LIFECYCLE_LABELS[client.lifecycleStatus]}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            <Camera className="h-3 w-3 inline mr-0.5" />
                            {clientPhotos.length}{" "}
                            <LineChart className="h-3 w-3 inline ml-1.5 mr-0.5" />
                            {clientProgress.length}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <Tabs defaultValue="photos">
                        <TabsList>
                          <TabsTrigger value="photos">
                            Photos ({clientPhotos.length})
                          </TabsTrigger>
                          <TabsTrigger value="report">
                            Progress Report ({clientProgress.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="photos" className="mt-3">
                          {clientPhotos.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground text-sm">
                              <ImageOff className="h-6 w-6 mx-auto mb-1 opacity-50" />
                              No photos uploaded yet
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {clientPhotos.map((p) => (
                                <div
                                  key={p.id}
                                  className="rounded-md border overflow-hidden bg-muted"
                                  data-testid={`photo-${p.id}`}
                                >
                                  <img
                                    src={p.photoUrl}
                                    alt={`${client.name} ${p.mealType}`}
                                    className="w-full h-32 object-cover"
                                    onError={(e) => {
                                      (
                                        e.currentTarget as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                  <div className="p-2 space-y-0.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <Badge
                                        variant="outline"
                                        className="text-[10px]"
                                      >
                                        {p.mealType}
                                      </Badge>
                                      <span className="text-muted-foreground">
                                        {fmtDate(p.date)}
                                      </span>
                                    </div>
                                    {p.remarks && (
                                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                                        {p.remarks}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="report" className="mt-3">
                          {clientProgress.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground text-sm">
                              No progress entries recorded yet
                            </div>
                          ) : (
                            <div className="rounded-md border overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">
                                      Weight (kg)
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Waist
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Hip
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Chest
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Arm
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Compliance
                                    </TableHead>
                                    <TableHead>Notes</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {clientProgress.map((entry) => (
                                    <TableRow key={entry.id}>
                                      <TableCell className="font-medium whitespace-nowrap">
                                        {fmtDate(entry.date)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {entry.weight}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {entry.waist}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {entry.hip}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {entry.chest}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {entry.arm}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {entry.mealCompliance}%
                                      </TableCell>
                                      <TableCell className="max-w-[280px] text-xs text-muted-foreground">
                                        {entry.notes ?? "—"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
