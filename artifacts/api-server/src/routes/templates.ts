import { Router, type IRouter } from "express";
import { db, templates, insertTemplateSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

router.get("/templates", async (req, res, next) => {
  try {
    const category = typeof req.query["category"] === "string" ? req.query["category"] : undefined;
    const rows = category
      ? await db
          .select()
          .from(templates)
          .where(eq(templates.category, category as any))
          .orderBy(desc(templates.createdAt))
      : await db.select().from(templates).orderBy(desc(templates.createdAt));
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/templates", async (req, res, next) => {
  try {
    const data = insertTemplateSchema.parse(req.body);
    const [row] = await db.insert(templates).values(data).returning();
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

router.patch("/templates/:id", async (req, res, next) => {
  try {
    const data = insertTemplateSchema.partial().parse(req.body);
    const [row] = await db
      .update(templates)
      .set(data)
      .where(eq(templates.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Template not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete("/templates/:id", async (req, res, next) => {
  try {
    const [row] = await db
      .delete(templates)
      .where(eq(templates.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Template not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
