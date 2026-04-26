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
- **Auth**: Replit Auth (OpenID Connect via `openid-client`) with sessions in Postgres
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

## Auth (Replit Auth)

`artifacts/api-server/src/auth/*` mounts the Replit OIDC integration:

- `GET /api/login` → redirect to Replit consent screen
- `GET /api/callback` → OIDC callback, sets session cookie
- `GET /api/logout` → clear session, redirect to Replit end-session
- `GET /api/auth/user` → returns the current `users` row (401 if not signed in)

Sessions are stored in the `sessions` table (managed by `connect-pg-simple`,
sharing the `@workspace/db` pool so it inherits the SSL config).

On the frontend:

- `src/hooks/use-auth.ts` — `useAuth()` queries `/api/auth/user`
- `src/components/RequireAuth.tsx` — route guard that redirects to `/login`
- `src/pages/login.tsx` — single "Sign in" button → `window.location = "/api/login"`
- `src/layouts/AppLayout.tsx` — logout link → `window.location = "/api/logout"`
- `src/lib/queryClient.ts` — `apiFetch` helper that always sends `credentials: "include"`

The vite dev server proxies `/api/*` to the api-server (`vite.config.ts`).

## API Routes

All non-auth routes live under `/api` and require `isAuthenticated`:

| Resource         | Endpoints                                                          |
| ---------------- | ------------------------------------------------------------------ |
| Clients          | `GET/POST /clients`, `GET/PATCH/DELETE /clients/:id`               |
| Staff            | `GET/POST /staff`, `GET/PATCH/DELETE /staff/:id`                   |
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
