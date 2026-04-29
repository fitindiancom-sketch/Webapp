import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, clients, insertClientSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated, authStorage } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

/**
 * Default password assigned to every auto-generated client login.
 * The dietitian shares this with the client on first sign-in; the client
 * can change it from the change-password screen afterwards.
 */
const DEFAULT_CLIENT_PASSWORD = "Diet123";

const credentialsSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email().optional().or(z.literal("")),
    mobile: z.string().trim().optional().or(z.literal("")),
  })
  .refine((v) => (v.email && v.email.length > 0) || (v.mobile && v.mobile.length > 0), {
    message: "Either email or mobile is required to create a login",
  });

/**
 * Build the login email for a client. We prefer the real email when given;
 * otherwise we synthesize a stable address from the mobile number (digits
 * only) under the @client.nutricare.local domain. That keeps every client
 * login unique and lets the same login form (email + password) be reused.
 */
function buildClientLogin(email: string | undefined, mobile: string | undefined): string {
  const cleanEmail = (email ?? "").trim();
  if (cleanEmail.length > 0) return cleanEmail.toLowerCase();
  const digits = (mobile ?? "").replace(/\D/g, "");
  if (digits.length === 0) {
    throw new Error("Either email or mobile is required");
  }
  return `${digits}@client.nutricare.local`;
}

function splitName(fullName: string): { firstName: string; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() ?? fullName.trim();
  const lastName = parts.length > 0 ? parts.join(" ") : null;
  return { firstName, lastName };
}

router.get("/clients", async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get("/clients/:id", async (req, res, next) => {
  try {
    const [row] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, req.params.id));
    if (!row) {
      res.status(404).json({ message: "Client not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.post("/clients", async (req, res, next) => {
  try {
    const data = insertClientSchema.parse(req.body);
    const [row] = await db.insert(clients).values(data).returning();

    // Auto-provision a login for the new client using their email or mobile,
    // with the standard default password. Don't block client creation if the
    // login already exists — just report it to the caller.
    let credentials:
      | { login: string; password: string; created: boolean; reason?: string }
      | null = null;

    try {
      const login = buildClientLogin(row.email ?? undefined, row.phone ?? undefined);
      const existing = await authStorage.getUserByEmail(login);
      if (existing) {
        credentials = {
          login,
          password: DEFAULT_CLIENT_PASSWORD,
          created: false,
          reason: "An account with this login already exists",
        };
      } else {
        const passwordHash = await bcrypt.hash(DEFAULT_CLIENT_PASSWORD, 12);
        const { firstName, lastName } = splitName(row.name);
        await authStorage.createUser({
          email: login,
          passwordHash,
          firstName,
          lastName,
        });
        credentials = {
          login,
          password: DEFAULT_CLIENT_PASSWORD,
          created: true,
        };
      }
    } catch (credErr) {
      credentials = {
        login: "",
        password: DEFAULT_CLIENT_PASSWORD,
        created: false,
        reason:
          credErr instanceof Error ? credErr.message : "Unable to create login",
      };
    }

    res.status(201).json({ ...row, credentials });
  } catch (e) {
    next(e);
  }
});

/**
 * Create a login account for a client outside of the main create flow
 * (used by the frontend when the client is added via the local store).
 * Idempotent: if the login already exists, we still return the credentials
 * so the dietitian knows what to share.
 */
router.post("/clients/credentials", async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid input",
        issues: parsed.error.issues,
      });
      return;
    }

    const { name, email, mobile } = parsed.data;
    const login = buildClientLogin(email || undefined, mobile || undefined);
    const existing = await authStorage.getUserByEmail(login);

    if (existing) {
      res.status(200).json({
        login,
        password: DEFAULT_CLIENT_PASSWORD,
        created: false,
        message: "An account with this login already exists",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(DEFAULT_CLIENT_PASSWORD, 12);
    const { firstName, lastName } = splitName(name);
    await authStorage.createUser({
      email: login,
      passwordHash,
      firstName,
      lastName,
    });

    res.status(201).json({
      login,
      password: DEFAULT_CLIENT_PASSWORD,
      created: true,
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/clients/:id", async (req, res, next) => {
  try {
    const data = insertClientSchema.partial().parse(req.body);
    const [row] = await db
      .update(clients)
      .set(data)
      .where(eq(clients.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Client not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete("/clients/:id", async (req, res, next) => {
  try {
    const [row] = await db
      .delete(clients)
      .where(eq(clients.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Client not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
