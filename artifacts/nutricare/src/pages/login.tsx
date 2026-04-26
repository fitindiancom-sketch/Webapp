import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "../hooks/use-auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <span className="text-primary font-bold text-2xl">NC</span>
          </div>
          <CardTitle className="text-2xl">Welcome to NutriCare</CardTitle>
          <CardDescription>
            Sign in with your Replit account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={isLoading}
            data-testid="button-login"
          >
            {isLoading ? "Checking session…" : "Sign in"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to Replit to authenticate, then returned here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
