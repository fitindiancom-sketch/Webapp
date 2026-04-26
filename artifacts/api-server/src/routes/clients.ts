import { Router, type IRouter } from "express";
import { db, clients, insertClientSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

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
    res.status(201).json(row);
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
