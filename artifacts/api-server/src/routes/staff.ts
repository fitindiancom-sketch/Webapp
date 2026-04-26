import { Router, type IRouter } from "express";
import { db, staff, insertStaffSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

router.get("/staff", async (_req, res, next) => {
  try {
    const rows = await db.select().from(staff).orderBy(desc(staff.createdAt));
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get("/staff/:id", async (req, res, next) => {
  try {
    const [row] = await db.select().from(staff).where(eq(staff.id, req.params.id));
    if (!row) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.post("/staff", async (req, res, next) => {
  try {
    const data = insertStaffSchema.parse(req.body);
    const [row] = await db.insert(staff).values(data).returning();
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

router.patch("/staff/:id", async (req, res, next) => {
  try {
    const data = insertStaffSchema.partial().parse(req.body);
    const [row] = await db
      .update(staff)
      .set(data)
      .where(eq(staff.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete("/staff/:id", async (req, res, next) => {
  try {
    const [row] = await db.delete(staff).where(eq(staff.id, req.params.id)).returning();
    if (!row) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
