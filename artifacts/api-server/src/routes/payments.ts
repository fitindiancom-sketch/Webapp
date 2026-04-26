import { Router, type IRouter } from "express";
import { db, payments, insertPaymentSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

router.get("/payments", async (req, res, next) => {
  try {
    const clientId = typeof req.query["clientId"] === "string" ? req.query["clientId"] : undefined;
    const rows = clientId
      ? await db
          .select()
          .from(payments)
          .where(eq(payments.clientId, clientId))
          .orderBy(desc(payments.paymentDate))
      : await db.select().from(payments).orderBy(desc(payments.paymentDate));
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/payments", async (req, res, next) => {
  try {
    const data = insertPaymentSchema.parse(req.body);
    const [row] = await db.insert(payments).values(data).returning();
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

router.patch("/payments/:id", async (req, res, next) => {
  try {
    const data = insertPaymentSchema.partial().parse(req.body);
    const [row] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete("/payments/:id", async (req, res, next) => {
  try {
    const [row] = await db
      .delete(payments)
      .where(eq(payments.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
