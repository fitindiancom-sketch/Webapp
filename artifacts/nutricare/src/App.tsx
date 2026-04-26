import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { RequireAuth } from "@/components/RequireAuth";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Clients from "./pages/clients";
import DietPlans from "./pages/diet-plans";
import Calendar from "./pages/calendar";
import Progress from "./pages/progress";
import Staff from "./pages/staff";
import Payments from "./pages/payments";
import Reports from "./pages/reports";
import Notifications from "./pages/notifications";
import Settings from "./pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function ProtectedRouter() {
  return (
    <RequireAuth>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/diet-plans" component={DietPlans} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/progress" component={Progress} />
        <Route path="/staff" component={Staff} />
        <Route path="/payments" component={Payments} />
        <Route path="/reports" component={Reports} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/settings" component={Settings} />
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </RequireAuth>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route component={ProtectedRouter} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
