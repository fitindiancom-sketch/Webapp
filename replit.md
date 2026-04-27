# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

This workspace currently hosts the **NutriCare** application: a dietitian/clinic
management web app with a React/Vite frontend, an Express API server backed by
Drizzle/Postgres, and Replit Auth for sign-in.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: Supabase Postgres + Drizzle ORM
- **Auth**: Custom email/password auth (bcrypt + express-session) backed by Supabase Postgres
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Frontend**: React 19, Vite, wouter, @tanstack/react-query, shadcn/ui

## Workspace Layout

- `artifacts/nutricare` — React/Vite frontend (port `19366`, external `3000`)
- `artifacts/api-server` — Express API (port `8080`)
- `artifacts/mockup-sandbox` — component preview server (port `8081`)
- `lib/db` — Drizzle schemas, shared `pool` and `db` (`@workspace/db`)
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react` — OpenAPI tooling

## Database Connection

The api-server connects to **Supabase** Postgres. We use the **transaction
pooler** endpoint (Supavisor) instead of the direct host because the direct
`db.<ref>.supabase.co:5432` host is IPv6-only and unreachable from the
Replit container.

Connection string is read from these env vars in priority order
(see `lib/db/src/index.ts`):

1. `SUPABASE_PG_URL` (preferred, plain env var)
2. `SUPABASE_DATABASE_URL` (only used if it starts with `postgres`)
3. `DATABASE_URL` (fallback to the local Replit Postgres)

The pool always passes `ssl: { rejectUnauthorized: false }` for `*.supabase.*`
hosts because Supabase serves a self-signed cert chain. We strip any
`sslmode=` query parameter from the URI so the new pg `verify-full` default
doesn't override our `ssl` setting.

We **never** run `drizzle-kit push` against the user's Supabase. Their
schema is the source of truth; the Drizzle schemas in `lib/db/src/schema/*`
mirror that DDL exactly. The only DDL the app issues is an idempotent
`CREATE TABLE IF NOT EXISTS` for the auth `sessions` and `users` tables
(see `artifacts/api-server/src/lib/initDb.ts`).

## Auth (Custom email/password)

`artifacts/api-server/src/auth/*` implements a self-hosted auth system:

- `customAuth.ts` — express-session middleware, sessions stored in Postgres
  via `connect-pg-simple` sharing the `@workspace/db` pool. `isAuthenticated`
  guard checks for `req.session.userId`.
- `storage.ts` — `getUser`, `getUserByEmail`, `createUser` against the
  `users` table.
- `routes.ts` — public REST endpoints:
  - `POST /api/auth/register` — body `{ email, password, firstName?, lastName? }`,
    bcrypt-hashes the password, inserts the user, starts a session, returns
    the public user shape.
  - `POST /api/auth/change-password` — auth-required, body
    `{ currentPassword, newPassword }`, updates the signed-in user's password.
  - `POST /api/admin/users` — auth-required, body
    `{ email, password, firstName?, lastName? }`, creates a login account for
    another person (used by the Staff page when an admin adds a staff member).
    Does **not** modify the current admin's session. Returns 409 on duplicate
    email.
  - `POST /api/auth/login` — body `{ email, password }`, verifies bcrypt
    hash, starts a session.
  - `POST /api/auth/logout` — destroys the session and clears the cookie.
  - `GET /api/auth/user` — returns the signed-in user (401 otherwise).

Cookies use `secure: 'auto'` so they work both behind Replit's HTTPS proxy
and over plain HTTP locally. The Vite proxy is configured with `xfwd: true`
so the API server sees the correct `X-Forwarded-Proto` and trust-proxy can
detect HTTPS.

The `users` table now has an extra `password_hash` column. The schema is
defined in `lib/db/src/schema/auth.ts`; `initDb.ts` ensures the column
exists with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

Required env vars:

- `SESSION_SECRET` — signing key for session cookies (already set).
- `SUPABASE_PG_URL` — Supabase transaction-pooler URI.

On the frontend:

- `src/hooks/use-auth.ts` — `useAuth()` (current user), `useLogin()`,
  `useRegister()`, `useLogout()`, `useChangePassword()`,
  `useCreateStaffAccount()` mutations.
- `src/components/RequireAuth.tsx` — route guard that redirects to `/login`.
- `src/components/ChangePasswordDialog.tsx` — modal opened from the avatar
  dropdown; lets the signed-in user update their own password.
- `src/pages/client-reports.tsx` — sub-page of Clients at
  `/clients/reports`. Shares the Clients page filter bar (search, dietitian,
  city, plan, date) plus the lifecycle/registration pills (defaults to
  "Active"). Each filtered client expands into Photos and Progress Report
  tabs. Reachable via the "Reports & Data" button on the Clients page header.
- `src/pages/login.tsx` — email + password form, link to `/register`.
- `src/pages/register.tsx` — sign-up form (first/last name, email, password +
  confirm).
- `src/layouts/AppLayout.tsx` — avatar dropdown has **Change Password** and
  **Logout** items; logout navigates to `/login`.
- `src/lib/queryClient.ts` — `apiFetch` helper sends `credentials: "include"`.
- `src/lib/apiError.ts` — `extractApiError(err, fallback)` parses the JSON
  message body that `apiFetch` puts on `Error.message`.

The vite dev server proxies `/api/*` to the api-server (`vite.config.ts`).

## API Routes

All non-auth routes live under `/api` and require `isAuthenticated`:

| Resource         | Endpoints                                                          |
| ---------------- | ------------------------------------------------------------------ |
| Clients          | `GET/POST /clients`, `GET/PATCH/DELETE /clients/:id`               |
| Staff            | `GET/POST /staff`, `GET/PATCH/DELETE /staff/:id`                   |
| Admin users      | `POST /admin/users` (creates a login account; auth required)       |
| Diet plans       | `GET/POST /diet-plans`, `GET/PATCH/DELETE /diet-plans/:id`         |
| Diet plan meals  | `PUT/DELETE /diet-plans/:id/meals/:mealType`                       |
| Diet plan parts  | `PUT/DELETE /diet-plans/:id/sections/:sectionType`                 |
| Templates        | `GET/POST /templates`, `PATCH/DELETE /templates/:id`               |
| Photos           | `GET/POST /photos`, `DELETE /photos/:id`                           |
| Progress logs    | `GET/POST /progress-logs`, `DELETE /progress-logs/:id`             |
| Payments         | `GET/POST /payments`, `PATCH/DELETE /payments/:id`                 |
| Dashboard        | `GET /dashboard/summary`                                           |

Errors flow through `src/middlewares/error.ts`:
ZodError → 400 with issues; any other error → 500. The handler short-circuits
if `res.headersSent` (e.g. after a redirect).

## Outstanding Work

- The frontend's `src/api/*.ts` modules still hold the original mock
  implementations from the design pass. They should be migrated to the real
  REST endpoints, with adapters between the snake_case DB schema (e.g.
  `client_code`, `phone`, `diet_type`) and the existing camelCase frontend
  types (`clientId`, `mobile`, `planType`). Auth and the API surface are
  already in place; this is the remaining client-side wiring.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/nutricare run dev` — run the frontend locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and
package details.
