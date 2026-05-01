import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../layouts/AppLayout";
import { apiFetch } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Phone, PhoneCall, PhoneOff, PhoneMissed,
  Camera, CheckCircle, RefreshCw, Plus, Trash2,
  ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import { format, addDays, subDays, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentCalls {
  connected: number;
  notConnected: number;
  dialed: number;
  total: number;
}

interface AgentPhotos {
  reviewed: number;
  approved: number;
}

interface AgentStat {
  staffId: string;
  name: string;
  role: string;
  email: string | null;
  avatarUrl: string | null;
  calls: AgentCalls;
  photos: AgentPhotos;
}

interface DailyStats {
  date: string;
  totals: {
    connected: number;
    notConnected: number;
    dialed: number;
    total: number;
    photosReviewed: number;
    photosApproved: number;
  };
  agents: AgentStat[];
}

interface CallLog {
  id: string;
  staff_id: string;
  staff_name: string;
  client_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  call_status: "connected" | "not_connected" | "dialed";
  call_date: string;
  call_time: string;
  duration_seconds: number;
  notes: string | null;
}

interface Photo {
  id: string;
  client_id: string;
  client_name: string;
  photo_url: string;
  meal_type: string;
  is_approved: boolean | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  remarks: string | null;
  uploaded_at: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string) {
  try {
    return format(new Date(iso), "hh:mm a");
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function statusBadge(status: string) {
  if (status === "connected")
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><PhoneCall className="h-3 w-3 mr-1" />Connected</Badge>;
  if (status === "not_connected")
    return <Badge className="bg-red-100 text-red-700 border-red-200"><PhoneOff className="h-3 w-3 mr-1" />Not Connected</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><PhoneMissed className="h-3 w-3 mr-1" />Dialed</Badge>;
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: any; color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Log Call Dialog ──────────────────────────────────────────────────────────

function LogCallDialog({
  open, onClose, date, staff,
}: {
  open: boolean; onClose: () => void; date: string; staff: StaffMember[];
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    staffId: "",
    callStatus: "connected" as "connected" | "not_connected" | "dialed",
    durationSeconds: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: (body: any) =>
      apiFetch("/api/support-team/call-logs", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Call logged successfully" });
      qc.invalidateQueries({ queryKey: ["support-team-stats"] });
      qc.invalidateQueries({ queryKey: ["support-team-call-logs"] });
      onClose();
      setForm({ staffId: "", callStatus: "connected", durationSeconds: "", notes: "" });
    },
    onError: () => toast({ title: "Failed to log call", variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!form.staffId) return toast({ title: "Please select a staff member", variant: "destructive" });
    mutation.mutate({
      staffId: form.staffId,
      callStatus: form.callStatus,
      callDate: date,
      durationSeconds: form.durationSeconds ? Number(form.durationSeconds) : 0,
      notes: form.notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Call</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Staff Member</Label>
            <Select value={form.staffId} onValueChange={(v) => setForm((f) => ({ ...f, staffId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select agent..." /></SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Call Status</Label>
            <Select value={form.callStatus} onValueChange={(v: any) => setForm((f) => ({ ...f, callStatus: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="not_connected">Not Connected</SelectItem>
                <SelectItem value="dialed">Dialed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Duration (seconds)</Label>
            <Input
              type="number" min={0} placeholder="e.g. 120"
              value={form.durationSeconds}
              onChange={(e) => setForm((f) => ({ ...f, durationSeconds: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Log Call"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Photo Review Dialog ──────────────────────────────────────────────────────

function PhotoReviewDialog({
  photo, staffList, onClose,
}: {
  photo: Photo | null; staffList: StaffMember[]; onClose: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [reviewedBy, setReviewedBy] = useState(photo?.reviewed_by ?? "");
  const [remarks, setRemarks] = useState(photo?.remarks ?? "");

  const mutation = useMutation({
    mutationFn: ({ isApproved }: { isApproved: boolean }) =>
      apiFetch(`/api/photos/${photo!.id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ isApproved, reviewedBy, remarks }),
      }),
    onSuccess: (_, { isApproved }) => {
      toast({ title: isApproved ? "Photo approved" : "Photo rejected" });
      qc.invalidateQueries({ queryKey: ["support-team-stats"] });
      qc.invalidateQueries({ queryKey: ["support-team-photos"] });
      onClose();
    },
    onError: () => toast({ title: "Failed to review photo", variant: "destructive" }),
  });

  if (!photo) return null;

  return (
    <Dialog open={!!photo} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Photo — {photo.client_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img src={photo.photo_url} alt="meal" className="w-full max-h-64 object-contain rounded-lg border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="capitalize">{photo.meal_type}</Badge>
            <span>{format(new Date(photo.uploaded_at), "dd MMM yyyy, hh:mm a")}</span>
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label>Reviewed By</Label>
            <Select value={reviewedBy} onValueChange={setReviewedBy}>
              <SelectTrigger><SelectValue placeholder="Select reviewer..." /></SelectTrigger>
              <SelectContent>
                {staffList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Remarks</Label>
            <Textarea
              placeholder="Feedback for client..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate({ isApproved: false })}
            disabled={!reviewedBy || mutation.isPending}
          >
            Reject
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => mutation.mutate({ isApproved: true })}
            disabled={!reviewedBy || mutation.isPending}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupportTeam() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [date, setDate] = useState(todayStr());
  const [logCallOpen, setLogCallOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [filterStaff, setFilterStaff] = useState("all");

  const statsQuery = useQuery<DailyStats>({
    queryKey: ["support-team-stats", date],
    queryFn: () => apiFetch(`/api/support-team/daily-stats?date=${date}`),
  });

  const callLogsQuery = useQuery<CallLog[]>({
    queryKey: ["support-team-call-logs", date, filterStaff],
    queryFn: () =>
      apiFetch(
        `/api/support-team/call-logs?date=${date}${filterStaff !== "all" ? `&staffId=${filterStaff}` : ""}`
      ),
  });

  const photosQuery = useQuery<Photo[]>({
    queryKey: ["support-team-photos", date],
    queryFn: () => apiFetch(`/api/support-team/photos?date=${date}`),
  });

  const deleteCallLog = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/support-team/call-logs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-team-stats"] });
      qc.invalidateQueries({ queryKey: ["support-team-call-logs"] });
      toast({ title: "Call log deleted" });
    },
  });

  const stats = statsQuery.data;
  const agents = stats?.agents ?? [];
  const staffList = agents.map((a) => ({ id: a.staffId, name: a.name, role: a.role }));

  const prevDay = () => setDate(format(subDays(parseISO(date), 1), "yyyy-MM-dd"));
  const nextDay = () => {
    const next = addDays(parseISO(date), 1);
    if (next <= new Date()) setDate(format(next, "yyyy-MM-dd"));
  };

  const isToday = date === todayStr();
  const displayDate = date === todayStr() ? "Today" : format(parseISO(date), "dd MMM yyyy");

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Support Team</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Daily call activity & photo review dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevDay}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-medium text-muted-foreground hidden sm:block">{displayDate}</span>
            </div>
            <Button variant="outline" size="icon" onClick={nextDay} disabled={isToday}><ChevronRight className="h-4 w-4" /></Button>
            {!isToday && (
              <Button variant="ghost" size="sm" onClick={() => setDate(todayStr())}>Today</Button>
            )}
            <Button variant="outline" size="icon" onClick={() => {
              qc.invalidateQueries({ queryKey: ["support-team-stats"] });
              qc.invalidateQueries({ queryKey: ["support-team-call-logs"] });
              qc.invalidateQueries({ queryKey: ["support-team-photos"] });
            }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setLogCallOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />Log Call
            </Button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        {statsQuery.isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-5 h-24 animate-pulse bg-muted rounded-lg" /></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Calls" value={stats?.totals.total ?? 0} icon={Phone} color="bg-blue-100 text-blue-600" />
            <StatCard label="Connected" value={stats?.totals.connected ?? 0} icon={PhoneCall} color="bg-emerald-100 text-emerald-600" />
            <StatCard label="Not Connected" value={stats?.totals.notConnected ?? 0} icon={PhoneOff} color="bg-red-100 text-red-600" />
            <StatCard label="Dialed" value={stats?.totals.dialed ?? 0} icon={PhoneMissed} color="bg-yellow-100 text-yellow-600" />
            <StatCard label="Photos Reviewed" value={stats?.totals.photosReviewed ?? 0} icon={Camera} color="bg-purple-100 text-purple-600" />
            <StatCard label="Photos Approved" value={stats?.totals.photosApproved ?? 0} icon={CheckCircle} color="bg-teal-100 text-teal-600" />
          </div>
        )}

        {/* ── Tabs ── */}
        <Tabs defaultValue="agents">
          <TabsList className="mb-2">
            <TabsTrigger value="agents">Agent Wise</TabsTrigger>
            <TabsTrigger value="calllogs">Call Logs</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          {/* ── Agent Wise Tab ── */}
          <TabsContent value="agents">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Agent Performance — {displayDate}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-center">Total Calls</TableHead>
                        <TableHead className="text-center text-emerald-600">Connected</TableHead>
                        <TableHead className="text-center text-red-600">Not Connected</TableHead>
                        <TableHead className="text-center text-yellow-600">Dialed</TableHead>
                        <TableHead className="text-center text-purple-600">Photos Reviewed</TableHead>
                        <TableHead className="text-center text-teal-600">Photos Approved</TableHead>
                        <TableHead className="text-center">Approval %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statsQuery.isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 9 }).map((_, j) => (
                              <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : agents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                            No staff found
                          </TableCell>
                        </TableRow>
                      ) : (
                        agents.map((agent) => {
                          const approvalPct = agent.photos.reviewed > 0
                            ? Math.round((agent.photos.approved / agent.photos.reviewed) * 100)
                            : null;
                          return (
                            <TableRow key={agent.staffId}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {agent.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{agent.name}</p>
                                    <p className="text-xs text-muted-foreground">{agent.email ?? "—"}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize text-xs">{agent.role}</Badge>
                              </TableCell>
                              <TableCell className="text-center font-semibold">{agent.calls.total}</TableCell>
                              <TableCell className="text-center">
                                <span className="font-semibold text-emerald-600">{agent.calls.connected}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-semibold text-red-600">{agent.calls.notConnected}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-semibold text-yellow-600">{agent.calls.dialed}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-semibold text-purple-600">{agent.photos.reviewed}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-semibold text-teal-600">{agent.photos.approved}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                {approvalPct !== null ? (
                                  <Badge className={`${approvalPct >= 80 ? "bg-emerald-100 text-emerald-700" : approvalPct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                    {approvalPct}%
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Call Logs Tab ── */}
          <TabsContent value="calllogs">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Call Logs — {displayDate}</CardTitle>
                  <Select value={filterStaff} onValueChange={setFilterStaff}>
                    <SelectTrigger className="w-44 h-8 text-sm">
                      <SelectValue placeholder="All Agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      {staffList.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {callLogsQuery.isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 7 }).map((_, j) => (
                              <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : !callLogsQuery.data?.length ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                            No call logs for this day
                          </TableCell>
                        </TableRow>
                      ) : (
                        callLogsQuery.data.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatTime(log.call_time)}
                            </TableCell>
                            <TableCell className="font-medium text-sm">{log.staff_name}</TableCell>
                            <TableCell className="text-sm">
                              {log.client_name ? (
                                <div>
                                  <p className="font-medium">{log.client_name}</p>
                                  <p className="text-xs text-muted-foreground">{log.client_phone}</p>
                                </div>
                              ) : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>{statusBadge(log.call_status)}</TableCell>
                            <TableCell className="text-sm">{formatDuration(log.duration_seconds)}</TableCell>
                            <TableCell className="text-sm max-w-xs truncate">{log.notes ?? "—"}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteCallLog.mutate(log.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Photos Tab ── */}
          <TabsContent value="photos">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Photos Uploaded — {displayDate}</CardTitle>
              </CardHeader>
              <CardContent>
                {photosQuery.isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : !photosQuery.data?.length ? (
                  <div className="text-center text-muted-foreground py-10">No photos uploaded on this day</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photosQuery.data.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group rounded-xl overflow-hidden border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={photo.photo_url}
                          alt="meal"
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/300x200?text=Photo";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                        {photo.is_approved !== null && (
                          <div className="absolute top-2 right-2">
                            <Badge className={photo.is_approved ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}>
                              {photo.is_approved ? "Approved" : "Rejected"}
                            </Badge>
                          </div>
                        )}
                        <div className="p-2 bg-card">
                          <p className="text-xs font-medium truncate">{photo.client_name}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs capitalize mt-0.5">{photo.meal_type}</Badge>
                            {photo.reviewed_by_name && (
                              <p className="text-xs text-muted-foreground">by {photo.reviewed_by_name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <LogCallDialog
        open={logCallOpen}
        onClose={() => setLogCallOpen(false)}
        date={date}
        staff={staffList}
      />

      <PhotoReviewDialog
        photo={selectedPhoto}
        staffList={staffList}
        onClose={() => setSelectedPhoto(null)}
      />
    </AppLayout>
  );
}
