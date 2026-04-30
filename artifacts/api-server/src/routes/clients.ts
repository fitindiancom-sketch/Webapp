import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, clients, staff, insertClientSchema } from "@workspace/db";
import { and, eq, desc, inArray, ne, sql } from "drizzle-orm";
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
 * Build the login email for a client. Mobile is the primary identifier
 * (most clients give us a phone number, not an email), so we synthesize a
 * stable address from the mobile digits under the @client.nutricare.local
 * domain. We only fall back to a real email when no mobile is on file.
 * That keeps every client login unique and lets the same login form
 * (email + password) be reused.
 */
function buildClientLogin(email: string | undefined, mobile: string | undefined): string {
  const digits = (mobile ?? "").replace(/\D/g, "");
  if (digits.length > 0) return `${digits}@client.nutricare.local`;
  const cleanEmail = (email ?? "").trim();
  if (cleanEmail.length > 0) return cleanEmail.toLowerCase();
  throw new Error("A mobile number is required to create a login");
}

/**
 * Pick the best support staff for a brand-new client of a given registration
 * type. Mirrors the frontend logic in `lib/supportAssignment.ts`:
 *
 *   - Look at staff whose role = "support" and whose `supportChannel`
 *     matches the client's channel (with "all" / Support Lead as fallback).
 *   - Among matching active staff, pick the one with the FEWEST currently
 *     assigned non-inactive clients (load balancing).
 *   - Returns null when no support staff is available; the caller should
 *     leave `assignedSupportId` NULL so a manager can assign manually.
 */
async function pickSupportStaffId(
  registrationType: "online" | "visit" | "pune_visit",
): Promise<string | null> {
  const channelOrder: Array<"online" | "visit" | "pune_visit" | "all"> =
    registrationType === "online"
      ? ["online", "all"]
      : registrationType === "pune_visit"
        ? ["pune_visit", "visit", "all"]
        : ["visit", "all"];

  const candidates = await db
    .select({
      id: staff.id,
      channel: staff.supportChannel,
      load: sql<number>`COUNT(${clients.id})`.as("load"),
    })
    .from(staff)
    .leftJoin(
      clients,
      and(
        eq(clients.assignedSupportId, staff.id),
        ne(clients.status, "inactive"),
      ),
    )
    .where(
      and(
        eq(staff.role, "support"),
        eq(staff.status, "active"),
        inArray(staff.supportChannel, channelOrder),
      ),
    )
    .groupBy(staff.id, staff.supportChannel);

  if (candidates.length === 0) return null;

  // Sort by channel preference (lower index = more preferred), then by load.
  const ranked = candidates.sort((a, b) => {
    const ai = channelOrder.indexOf(a.channel ?? "all");
    const bi = channelOrder.indexOf(b.channel ?? "all");
    if (ai !== bi) return ai - bi;
    return Number(a.load) - Number(b.load);
  });
  return ranked[0]?.id ?? null;
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

    // Auto-assign a support staff member based on registration channel,
    // unless the caller explicitly provided one. Failure to find a match
    // leaves the field NULL — a manager can assign manually later.
    const channel = (data.registrationType ?? "online") as
      | "online"
      | "visit"
      | "pune_visit";
    const assignedSupportId =
      data.assignedSupportId ?? (await pickSupportStaffId(channel));

    const [row] = await db
      .insert(clients)
      .values({ ...data, assignedSupportId })
      .returning();

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
