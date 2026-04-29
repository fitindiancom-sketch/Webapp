import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/queryClient";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

const USER_QUERY_KEY = ["/api/auth/user"] as const;

/**
 * Custom email/password auth session. Fetches /api/auth/user; treats a 401 as
 * "not signed in" rather than an error so the UI can route to /login.
 */
export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery<AuthUser | null>({
    queryKey: USER_QUERY_KEY,
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

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<AuthUser, Error, LoginInput>({
    mutationFn: (body) =>
      apiFetch<AuthUser>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (user) => {
      qc.setQueryData(USER_QUERY_KEY, user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation<AuthUser, Error, RegisterInput>({
    mutationFn: (body) =>
      apiFetch<AuthUser>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (user) => {
      qc.setQueryData(USER_QUERY_KEY, user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      qc.setQueryData(USER_QUERY_KEY, null);
      qc.clear();
    },
  });
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  return useMutation<{ ok: true }, Error, ChangePasswordInput>({
    mutationFn: (body) =>
      apiFetch<{ ok: true }>("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export interface CreateStaffAccountInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Admin-only: create a login account for a newly-added staff member.
 * Does not change the current admin's session.
 */
export function useCreateStaffAccount() {
  return useMutation<
    { id: string; email: string | null },
    Error,
    CreateStaffAccountInput
  >({
    mutationFn: (body) =>
      apiFetch<{ id: string; email: string | null }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export interface CreateClientCredentialsInput {
  name: string;
  email?: string;
  mobile?: string;
}

export interface CreateClientCredentialsResult {
  login: string;
  password: string;
  created: boolean;
  message?: string;
}

/**
 * Auto-provision a login for a newly-added client. The backend uses the
 * client's email when present, otherwise synthesizes a stable login from the
 * mobile number. Password is the standard default ("Diet123") that the
 * dietitian shares with the client.
 */
export function useCreateClientCredentials() {
  return useMutation<
    CreateClientCredentialsResult,
    Error,
    CreateClientCredentialsInput
  >({
    mutationFn: (body) =>
      apiFetch<CreateClientCredentialsResult>("/api/clients/credentials", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}
