import { Router, type IRouter } from "express";
import { db, clients, payments, dietPlans } from "@workspace/db";
import { sql, sum, count } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

router.get("/dashboard/summary", async (_req, res, next) => {
  try {
    const statusCounts = await db
      .select({
        status: clients.status,
        count: count(clients.id),
      })
      .from(clients)
      .groupBy(clients.status);

    const [activePlans] = await db
      .select({ count: count(dietPlans.id) })
      .from(dietPlans)
      .where(sql`${dietPlans.status} = 'active'`);

    const [revenue30d] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(
        sql`${payments.status} = 'paid' AND ${payments.paymentDate} >= CURRENT_DATE - INTERVAL '30 days'`,
      );

    const renewalsDue = await db
      .select({ count: count(payments.id) })
      .from(payments)
      .where(
        sql`${payments.renewalDueDate} BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`,
      );

    res.json({
      clientsByStatus: statusCounts,
      activePlans: activePlans?.count ?? 0,
      revenueLast30Days: revenue30d?.total ?? "0",
      renewalsDueNext7Days: renewalsDue[0]?.count ?? 0,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
