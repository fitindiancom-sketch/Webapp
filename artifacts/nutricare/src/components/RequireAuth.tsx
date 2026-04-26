import { useEffect, type ReactNode } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "../hooks/use-auth";

interface Props {
  children: ReactNode;
}

export function RequireAuth({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location !== "/login") {
      // no-op; <Redirect/> below handles it. This keeps the contract obvious.
    }
  }, [isLoading, isAuthenticated, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
