import { Router, type IRouter } from "express";
import { db, staff, callLogs, photos } from "@workspace/db";
import { sql, eq, and, count } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import { z } from "zod";

const router: IRouter = Router();
router.use(isAuthenticated);

// ── GET /support-team/daily-stats?date=YYYY-MM-DD ──────────────────────
// Returns per-agent call stats and photo review stats for a given date.
router.get("/support-team/daily-stats", async (req, res, next) => {
  try {
    const dateStr =
      typeof req.query.date === "string"
        ? req.query.date
        : new Date().toISOString().slice(0, 10);

    // All staff members
    const allStaff = await db
      .select({
        id: staff.id,
        name: staff.name,
        role: staff.role,
        email: staff.email,
        avatarUrl: staff.avatarUrl,
      })
      .from(staff)
      .where(sql`${staff.status} = 'active'`);

    // Call stats per agent for the given date
    const callStats = await db.execute(sql`
      SELECT
        staff_id,
        COUNT(*) FILTER (WHERE call_status = 'connected')     AS connected,
        COUNT(*) FILTER (WHERE call_status = 'not_connected') AS not_connected,
        COUNT(*) FILTER (WHERE call_status = 'dialed')        AS dialed,
        COUNT(*)                                              AS total
      FROM call_logs
      WHERE call_date = ${dateStr}::date
      GROUP BY staff_id
    `);

    // Photo review stats per agent for the given date
    const photoStats = await db.execute(sql`
      SELECT
        reviewed_by                            AS staff_id,
        COUNT(*)                               AS total_reviewed,
        COUNT(*) FILTER (WHERE is_approved)    AS total_approved
      FROM photos
      WHERE reviewed_at::date = ${dateStr}::date
        AND reviewed_by IS NOT NULL
      GROUP BY reviewed_by
    `);

    const callMap = new Map<string, any>();
    for (const row of callStats.rows) {
      callMap.set(row.staff_id as string, row);
    }
    const photoMap = new Map<string, any>();
    for (const row of photoStats.rows) {
      photoMap.set(row.staff_id as string, row);
    }

    const agentStats = allStaff.map((s) => {
      const c = callMap.get(s.id) ?? {};
      const p = photoMap.get(s.id) ?? {};
      return {
        staffId: s.id,
        name: s.name,
        role: s.role,
        email: s.email,
        avatarUrl: s.avatarUrl,
        calls: {
          connected: Number(c.connected ?? 0),
          notConnected: Number(c.not_connected ?? 0),
          dialed: Number(c.dialed ?? 0),
          total: Number(c.total ?? 0),
        },
        photos: {
          reviewed: Number(p.total_reviewed ?? 0),
          approved: Number(p.total_approved ?? 0),
        },
      };
    });

    // Overall totals
    const totals = agentStats.reduce(
      (acc, a) => ({
        connected: acc.connected + a.calls.connected,
        notConnected: acc.notConnected + a.calls.notConnected,
        dialed: acc.dialed + a.calls.dialed,
        total: acc.total + a.calls.total,
        photosReviewed: acc.photosReviewed + a.photos.reviewed,
        photosApproved: acc.photosApproved + a.photos.approved,
      }),
      {
        connected: 0,
        notConnected: 0,
        dialed: 0,
        total: 0,
        photosReviewed: 0,
        photosApproved: 0,
      }
    );

    res.json({ date: dateStr, totals, agents: agentStats });
  } catch (e) {
    next(e);
  }
});

// ── GET /support-team/call-logs?date=YYYY-MM-DD&staffId=xxx ─────────────
router.get("/support-team/call-logs", async (req, res, next) => {
  try {
    const dateStr =
      typeof req.query.date === "string"
        ? req.query.date
        : new Date().toISOString().slice(0, 10);
    const staffId =
      typeof req.query.staffId === "string" ? req.query.staffId : null;

    const rows = await db.execute(sql`
      SELECT
        cl.id,
        cl.staff_id,
        s.name   AS staff_name,
        cl.client_id,
        c.name   AS client_name,
        c.phone  AS client_phone,
        cl.call_status,
        cl.call_date,
        cl.call_time,
        cl.duration_seconds,
        cl.notes
      FROM call_logs cl
      JOIN staff s ON s.id = cl.staff_id
      LEFT JOIN clients c ON c.id = cl.client_id
      WHERE cl.call_date = ${dateStr}::date
        ${staffId ? sql`AND cl.staff_id = ${staffId}::uuid` : sql``}
      ORDER BY cl.call_time DESC
      LIMIT 200
    `);

    res.json(rows.rows);
  } catch (e) {
    next(e);
  }
});

// ── POST /support-team/call-logs ─────────────────────────────────────────
const insertCallLogBodySchema = z.object({
  staffId: z.string().uuid(),
  clientId: z.string().uuid().optional(),
  callStatus: z.enum(["connected", "not_connected", "dialed"]),
  callDate: z.string().optional(),
  durationSeconds: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
});

router.post("/support-team/call-logs", async (req, res, next) => {
  try {
    const body = insertCallLogBodySchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ message: "Invalid input", errors: body.error.flatten() });
    }
    const { staffId, clientId, callStatus, callDate, durationSeconds, notes } = body.data;

    const [inserted] = await db.execute(sql`
      INSERT INTO call_logs (staff_id, client_id, call_status, call_date, duration_seconds, notes)
      VALUES (
        ${staffId}::uuid,
        ${clientId ?? null}::uuid,
        ${callStatus},
        ${callDate ?? new Date().toISOString().slice(0, 10)}::date,
        ${durationSeconds ?? 0},
        ${notes ?? null}
      )
      RETURNING *
    `);

    res.status(201).json(inserted);
  } catch (e) {
    next(e);
  }
});

// ── DELETE /support-team/call-logs/:id ───────────────────────────────────
router.delete("/support-team/call-logs/:id", async (req, res, next) => {
  try {
    await db.execute(sql`DELETE FROM call_logs WHERE id = ${req.params.id}::uuid`);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ── PATCH /photos/:id/review ─────────────────────────────────────────────
const reviewPhotoSchema = z.object({
  isApproved: z.boolean(),
  reviewedBy: z.string().uuid(),
  remarks: z.string().optional(),
});

router.patch("/photos/:id/review", async (req, res, next) => {
  try {
    const body = reviewPhotoSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const { isApproved, reviewedBy, remarks } = body.data;

    await db.execute(sql`
      UPDATE photos
      SET is_approved  = ${isApproved},
          reviewed_by  = ${reviewedBy}::uuid,
          reviewed_at  = now(),
          remarks      = ${remarks ?? null}
      WHERE id = ${req.params.id}::uuid
    `);

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ── GET /support-team/photos?date=YYYY-MM-DD ─────────────────────────────
router.get("/support-team/photos", async (req, res, next) => {
  try {
    const dateStr =
      typeof req.query.date === "string"
        ? req.query.date
        : new Date().toISOString().slice(0, 10);

    const rows = await db.execute(sql`
      SELECT
        p.id,
        p.client_id,
        c.name      AS client_name,
        p.photo_url,
        p.meal_type,
        p.is_approved,
        p.reviewed_by,
        s.name      AS reviewed_by_name,
        p.reviewed_at,
        p.remarks,
        p.uploaded_at
      FROM photos p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN staff s ON s.id = p.reviewed_by
      WHERE p.uploaded_at::date = ${dateStr}::date
      ORDER BY p.uploaded_at DESC
      LIMIT 200
    `);

    res.json(rows.rows);
  } catch (e) {
    next(e);
  }
});

export default router;
