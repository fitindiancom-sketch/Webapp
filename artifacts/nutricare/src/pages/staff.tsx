import React, { useState, useEffect } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePermissionsStore } from "../store/permissions";
import { staffApi } from "../api/staff";
import { Staff } from "../types";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { useCreateStaffAccount } from "../hooks/use-auth";
import { extractApiError } from "../lib/apiError";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { matrix, updatePermission } = usePermissionsStore();
  const createAccount = useCreateStaffAccount();

  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    name: "", email: "", mobile: "", role: "Dietitian", department: "", status: "Active", joinDate: format(new Date(), "yyyy-MM-dd")
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadStaff = async () => {
    const data = await staffApi.list();
    setStaff(data);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filteredStaff = staff.filter(s => {
    if (roleFilter !== "all" && s.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.mobile) {
      toast.error("Please fill required fields");
      return;
    }
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Split full name into first/last for the login account record.
    const trimmed = (newStaff.name ?? "").trim();
    const [firstName, ...rest] = trimmed.split(/\s+/);
    const lastName = rest.join(" ") || undefined;

    try {
      await createAccount.mutateAsync({
        email: newStaff.email!,
        password,
        firstName: firstName || undefined,
        lastName,
      });
    } catch (err) {
      toast.error(extractApiError(err, "Could not create login account"));
      return;
    }

    await staffApi.create(newStaff as Omit<Staff, "id">);
    toast.success("Staff added — they can sign in with this email and password");
    setIsAddModalOpen(false);
    setNewStaff({ name: "", email: "", mobile: "", role: "Dietitian", department: "", status: "Active", joinDate: format(new Date(), "yyyy-MM-dd") });
    setPassword("");
    setConfirmPassword("");
    loadStaff();
  };

  const handlePermissionChange = (role: string, permission: string, checked: boolean) => {
    updatePermission(role, permission, checked);
    toast.success("Permissions updated");
  };

  const roles = ["Dietitian", "Online Support", "Visit Support", "Admin"];
  const permissions = [
    { key: "viewClients", label: "View Clients" },
    { key: "editClients", label: "Edit Clients" },
    { key: "makeDietPlan", label: "Make Diet Plan" },
    { key: "viewPayments", label: "View Payments" },
    { key: "viewReports", label: "View Reports" },
    { key: "manageStaff", label: "Manage Staff" },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="Staff Management" 
        actions={<Button onClick={() => setIsAddModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Staff</Button>}
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search staff..." 
                    className="pl-8" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {["all", "dietitian", "online support", "visit support", "admin"].map(r => (
                  <Badge 
                    key={r} 
                    variant={roleFilter === r ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setRoleFilter(r)}
                  >
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Role & Dept</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No staff found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={s.avatar} />
                              <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{s.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{s.role}</div>
                          <div className="text-xs text-muted-foreground">{s.department}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{s.email}</div>
                          <div className="text-xs text-muted-foreground">{s.mobile}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(parseISO(s.joinDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.status === 'Active' ? 'default' : 'secondary'}>{s.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions Matrix</CardTitle>
            <CardDescription>Configure access rights for each role across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Role</TableHead>
                    {permissions.map(p => (
                      <TableHead key={p.key} className="text-center">{p.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role}>
                      <TableCell className="font-medium">{role}</TableCell>
                      {permissions.map((p) => {
                        const isChecked = matrix[role]?.[p.key] || false;
                        const disabled = role === "Admin"; // Admin has all permissions
                        return (
                          <TableCell key={p.key} className="text-center">
                            <Checkbox 
                              checked={isChecked} 
                              disabled={disabled}
                              onCheckedChange={(checked) => handlePermissionChange(role, p.key, checked as boolean)} 
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2 col-span-2">
              <Label>Full Name</Label>
              <Input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Mobile</Label>
              <Input value={newStaff.mobile} onChange={e => setNewStaff({...newStaff, mobile: e.target.value})} placeholder="+91 9999999999" />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={newStaff.role as string} onValueChange={v => setNewStaff({...newStaff, role: v as any})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Department</Label>
              <Input value={newStaff.department} onChange={e => setNewStaff({...newStaff, department: e.target.value})} placeholder="e.g. Clinical" />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={newStaff.status} onValueChange={v => setNewStaff({...newStaff, status: v as any})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Join Date</Label>
              <Input type="date" value={newStaff.joinDate} onChange={e => setNewStaff({...newStaff, joinDate: e.target.value})} />
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>Login Password</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                data-testid="input-staff-password"
              />
              <p className="text-xs text-muted-foreground">
                The staff member will sign in with their email and this password.
                They can change it later from their profile.
              </p>
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                data-testid="input-staff-confirm-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddStaff}
              disabled={createAccount.isPending}
              data-testid="button-add-staff-submit"
            >
              {createAccount.isPending ? "Adding..." : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
