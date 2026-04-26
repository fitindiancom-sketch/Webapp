import { pool } from "@workspace/db";
import { logger } from "./logger";

/**
 * Idempotently ensure the auth tables (sessions, users) exist in the
 * connected Postgres database. We do this directly via SQL rather than
 * `drizzle-kit push` so we never touch the user's existing application
 * tables (clients, staff, diet_plans, etc.) defined by their own schema.
 */
export async function ensureAuthTables(): Promise<void> {
  const ddl = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS sessions (
      sid     varchar PRIMARY KEY,
      sess    jsonb   NOT NULL,
      expire  timestamp NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

    CREATE TABLE IF NOT EXISTS users (
      id                 varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      email              varchar UNIQUE,
      first_name         varchar,
      last_name          varchar,
      profile_image_url  varchar,
      created_at         timestamp DEFAULT now(),
      updated_at         timestamp DEFAULT now()
    );
  `;

  const c = await pool.connect();
  try {
    await c.query(ddl);
    logger.info("Auth tables ensured");
  } finally {
    c.release();
  }
}
