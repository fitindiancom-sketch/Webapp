import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function pickConnectionString(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.SUPABASE_PG_URL,
    process.env.SUPABASE_DATABASE_URL,
  ];
  for (const v of candidates) {
    if (v && /^postgres(ql)?:\/\//i.test(v)) return v;
  }
  throw new Error(
    "No valid Postgres connection string found. Set DATABASE_URL to a postgresql://... URI.",
  );
}

const rawConnectionString = pickConnectionString();
const connectionString = rawConnectionString.replace(
  /([?&])sslmode=[^&]*(&|$)/,
  (_m, p1, p2) => (p2 === "&" ? p1 : p1 === "?" ? "" : ""),
);

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("supabase")
    ? { rejectUnauthorized: false }
    : undefined,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
