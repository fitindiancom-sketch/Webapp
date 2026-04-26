import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/queryClient";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

/**
 * Replit Auth–backed session. Fetches /api/auth/user; treats a 401 as
 * "not signed in" rather than an error so the UI can route to /login.
 */
export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        return await apiFetch<AuthUser>("/api/auth/user");
      } catch (e: any) {
        if (e?.status === 401) return null;
        throw e;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  return {
    user: data ?? null,
    isAuthenticated: !!data,
    isLoading,
    error,
    refetch,
  };
}
