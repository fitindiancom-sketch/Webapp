import { Router, type IRouter } from "express";
import { db, photos, insertPhotoSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

router.get("/photos", async (req, res, next) => {
  try {
    const clientId = typeof req.query["clientId"] === "string" ? req.query["clientId"] : undefined;
    const rows = clientId
      ? await db
          .select()
          .from(photos)
          .where(eq(photos.clientId, clientId))
          .orderBy(desc(photos.uploadedAt))
      : await db.select().from(photos).orderBy(desc(photos.uploadedAt));
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/photos", async (req, res, next) => {
  try {
    const data = insertPhotoSchema.parse(req.body);
    const [row] = await db.insert(photos).values(data).returning();
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

router.delete("/photos/:id", async (req, res, next) => {
  try {
    const [row] = await db
      .delete(photos)
      .where(eq(photos.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Photo not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
