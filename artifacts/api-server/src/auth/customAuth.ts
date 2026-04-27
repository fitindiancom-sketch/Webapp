import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { pool } from "@workspace/db";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  // Reuse the shared @workspace/db pool — it already has the correct
  // SSL config (rejectUnauthorized: false) for Supabase's cert chain.
  const sessionStore = new pgStore({
    pool: pool as any,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const secret = process.env["SESSION_SECRET"];
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is required for sessions",
    );
  }

  return session({
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // 'auto' lets express-session set the Secure flag whenever the
      // (trust-proxy-resolved) request is over HTTPS, and skip it for
      // plain HTTP. This works for both the Replit HTTPS proxy and any
      // local HTTP testing (e.g. curl against http://localhost:8080).
      secure: "auto",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

/**
 * Route guard. Requires a session with `userId` set; otherwise responds 401.
 */
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
