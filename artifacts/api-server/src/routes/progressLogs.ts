import { Router, type IRouter } from "express";
import { db, progressLogs, insertProgressLogSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

router.get("/progress-logs", async (req, res, next) => {
  try {
    const clientId = typeof req.query["clientId"] === "string" ? req.query["clientId"] : undefined;
    const rows = clientId
      ? await db
          .select()
          .from(progressLogs)
          .where(eq(progressLogs.clientId, clientId))
          .orderBy(desc(progressLogs.createdAt))
      : await db.select().from(progressLogs).orderBy(desc(progressLogs.createdAt));
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/progress-logs", async (req, res, next) => {
  try {
    const data = insertProgressLogSchema.parse(req.body);
    const [row] = await db.insert(progressLogs).values(data).returning();
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

router.delete("/progress-logs/:id", async (req, res, next) => {
  try {
    const [row] = await db
      .delete(progressLogs)
      .where(eq(progressLogs.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Progress log not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
