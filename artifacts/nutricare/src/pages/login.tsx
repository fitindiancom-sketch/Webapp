import React from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "../store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "../types";

export default function Login() {
  const [, setLocation] = useLocation();
  const login = useAuthStore(state => state.login);
  const [role, setRole] = React.useState<Role>("Super Admin");

  const handleLogin = () => {
    login({
      id: "demo-user",
      name: "Demo User",
      email: "demo@nutricare.com",
      role,
      avatar: "https://i.pravatar.cc/150?u=demo",
    });
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <span className="text-primary font-bold text-2xl">NC</span>
          </div>
          <CardTitle className="text-2xl">Welcome to NutriCare</CardTitle>
          <CardDescription>Select a demo role to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Demo Role</label>
            <Select value={role} onValueChange={(val) => setRole(val as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Dietitian">Dietitian</SelectItem>
                <SelectItem value="Online Support">Online Support</SelectItem>
                <SelectItem value="Visit Support">Visit Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleLogin}>
            Login as {role}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
