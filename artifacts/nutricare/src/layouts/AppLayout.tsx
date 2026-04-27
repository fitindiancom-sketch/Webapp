import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Calendar, Utensils,
  LineChart, Users2, CreditCard, PieChart,
  Bell, Settings, LogOut, Menu, KeyRound,
} from "lucide-react";
import { useAuth, useLogout } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "../components/ChangePasswordDialog";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/clients", icon: Users, label: "Clients" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/diet-plans", icon: Utensils, label: "Diet Plans" },
  { path: "/progress", icon: LineChart, label: "Progress" },
  { path: "/staff", icon: Users2, label: "Staff" },
  { path: "/payments", icon: CreditCard, label: "Payments" },
  { path: "/reports", icon: PieChart, label: "Reports" },
  { path: "/notifications", icon: Bell, label: "Notifications" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

function displayName(u: { firstName: string | null; lastName: string | null; email: string | null } | null): string {
  if (!u) return "User";
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return full || u.email || "User";
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const logout = useLogout();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      setLocation("/login");
    }
  };

  const name = displayName(user);
  const avatar = user?.profileImageUrl ?? undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen ? <span className="font-bold text-xl text-primary">NutriCare</span> : <span className="font-bold text-xl text-primary">NC</span>}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold hidden sm:block capitalize">
              {location.split('/')[1] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setLocation('/notifications')}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer h-9 w-9" data-testid="avatar-user">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{name}</div>
                  {user?.email && (
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid="button-change-password"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <KeyRound className="h-4 w-4 mr-2" /> Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="button-logout"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ChangePasswordDialog
              open={changePasswordOpen}
              onOpenChange={setChangePasswordOpen}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
