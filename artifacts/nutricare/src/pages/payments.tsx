import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiCard";
import { StatusPill } from "../components/StatusPill";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { paymentsApi } from "../api/payments";
import { clientsApi } from "../api/clients";
import { Payment, Client } from "../types";
import { toast } from "sonner";
import { format, parseISO, isSameWeek, isSameMonth } from "date-fns";
import { IndianRupee, FileText, CalendarClock, CreditCard, MoreHorizontal } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState("paid");
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newDate, setNewDate] = useState("");

  const fetchData = async () => {
    const [p, c] = await Promise.all([paymentsApi.list(), clientsApi.list()]);
    setPayments(p);
    setClients(c);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkPaid = async (payment: Payment) => {
    await paymentsApi.update(payment.id, { status: "Paid", paidDate: format(new Date(), "yyyy-MM-dd") });
    toast.success("Payment marked as paid");
    fetchData();
  };

  const handleSendReminder = (payment: Payment) => {
    const client = clients.find(c => c.id === payment.clientId);
    toast.success(`Reminder sent to ${client?.name}`);
  };

  const handleExtendPlan = async () => {
    if (!selectedPayment || !newDate) return;
    await paymentsApi.update(selectedPayment.id, { renewalDate: newDate });
    toast.success("Plan extended successfully");
    setExtendModalOpen(false);
    fetchData();
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => p.status.toLowerCase() === activeTab.replace("-", " "));
  }, [payments, activeTab]);

  const tabCounts = useMemo(() => {
    return {
      paid: payments.filter(p => p.status === "Paid").length,
      pending: payments.filter(p => p.status === "Pending").length,
      partial: payments.filter(p => p.status === "Partial").length,
      "renewal due": payments.filter(p => p.status === "Renewal Due").length,
      expired: payments.filter(p => p.status === "Expired").length,
    };
  }, [payments]);

  const stats = useMemo(() => {
    const thisMonthRev = payments.filter(p => p.status === "Paid" && isSameMonth(parseISO(p.paidDate), new Date())).reduce((a, b) => a + b.amount, 0);
    const pendingAmt = payments.filter(p => p.status === "Pending" || p.status === "Partial").reduce((a, b) => a + b.amount, 0);
    const renewalsThisWeek = payments.filter(p => isSameWeek(parseISO(p.renewalDate), new Date())).length;
    const activeSubs = payments.filter(p => p.status === "Paid" || p.status === "Renewal Due").length;
    return { thisMonthRev, pendingAmt, renewalsThisWeek, activeSubs };
  }, [payments]);

  return (
    <AppLayout>
      <PageHeader title="Payments & Renewals" />

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="This Month Revenue" value={`₹${stats.thisMonthRev.toLocaleString()}`} icon={IndianRupee} trend="+12% vs last month" />
          <KpiCard title="Pending Amount" value={`₹${stats.pendingAmt.toLocaleString()}`} icon={FileText} className="bg-destructive/5 border-destructive/20" />
          <KpiCard title="Renewals Due This Week" value={stats.renewalsThisWeek} icon={CalendarClock} />
          <KpiCard title="Active Subscriptions" value={stats.activeSubs} icon={CreditCard} />
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4 pt-4 border-b">
                <TabsList className="bg-transparent h-12 w-full justify-start gap-4">
                  {[
                    { id: "paid", label: "Paid" },
                    { id: "pending", label: "Pending" },
                    { id: "partial", label: "Partial" },
                    { id: "renewal due", label: "Renewal Due" },
                    { id: "expired", label: "Expired" }
                  ].map(tab => (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 flex items-center gap-2"
                    >
                      {tab.label}
                      <Badge variant="secondary" className="ml-1 opacity-70">{tabCounts[tab.id as keyof typeof tabCounts]}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Plan Type</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Renewal Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No records found for this status.</TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map(p => {
                        const client = clients.find(c => c.id === p.clientId);
                        return (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div className="font-medium">{client?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">{client?.clientId}</div>
                            </TableCell>
                            <TableCell className="font-semibold">₹{p.amount.toLocaleString()}</TableCell>
                            <TableCell>{p.planType}</TableCell>
                            <TableCell>{p.status === "Paid" ? format(parseISO(p.paidDate), "MMM d, yyyy") : "-"}</TableCell>
                            <TableCell>{format(parseISO(p.renewalDate), "MMM d, yyyy")}</TableCell>
                            <TableCell><StatusPill status={p.status} /></TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {p.status !== "Paid" && (
                                    <DropdownMenuItem onClick={() => handleMarkPaid(p)}>Mark as Paid</DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleSendReminder(p)}>Send Reminder</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setSelectedPayment(p); setNewDate(p.renewalDate); setExtendModalOpen(true); }}>Extend Plan</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={extendModalOpen} onOpenChange={setExtendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Plan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label>New Renewal Date</Label>
              <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExtendPlan}>Save Extension</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
