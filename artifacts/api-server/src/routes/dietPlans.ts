import { Router, type IRouter } from "express";
import {
  db,
  dietPlans,
  dietPlanMeals,
  dietPlanSections,
  insertDietPlanSchema,
  insertDietPlanMealSchema,
  insertDietPlanSectionSchema,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router: IRouter = Router();

router.use(isAuthenticated);

router.get("/diet-plans", async (req, res, next) => {
  try {
    const clientId = typeof req.query["clientId"] === "string"
      ? req.query["clientId"]
      : undefined;
    const rows = clientId
      ? await db
          .select()
          .from(dietPlans)
          .where(eq(dietPlans.clientId, clientId))
          .orderBy(desc(dietPlans.createdAt))
      : await db.select().from(dietPlans).orderBy(desc(dietPlans.createdAt));
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get("/diet-plans/:id", async (req, res, next) => {
  try {
    const [plan] = await db
      .select()
      .from(dietPlans)
      .where(eq(dietPlans.id, req.params.id));
    if (!plan) {
      res.status(404).json({ message: "Diet plan not found" });
      return;
    }
    const meals = await db
      .select()
      .from(dietPlanMeals)
      .where(eq(dietPlanMeals.dietPlanId, plan.id));
    const sections = await db
      .select()
      .from(dietPlanSections)
      .where(eq(dietPlanSections.dietPlanId, plan.id));
    res.json({ ...plan, meals, sections });
  } catch (e) {
    next(e);
  }
});

router.post("/diet-plans", async (req, res, next) => {
  try {
    const data = insertDietPlanSchema.parse(req.body);
    const [row] = await db.insert(dietPlans).values(data).returning();
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

router.patch("/diet-plans/:id", async (req, res, next) => {
  try {
    const data = insertDietPlanSchema.partial().parse(req.body);
    const [row] = await db
      .update(dietPlans)
      .set(data)
      .where(eq(dietPlans.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Diet plan not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete("/diet-plans/:id", async (req, res, next) => {
  try {
    const [row] = await db
      .delete(dietPlans)
      .where(eq(dietPlans.id, req.params.id))
      .returning();
    if (!row) {
      res.status(404).json({ message: "Diet plan not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Upsert a meal slot for a plan
router.put("/diet-plans/:id/meals/:mealType", async (req, res, next) => {
  try {
    const data = insertDietPlanMealSchema.parse({
      ...req.body,
      dietPlanId: req.params.id,
      mealType: req.params.mealType,
    });
    const [row] = await db
      .insert(dietPlanMeals)
      .values(data)
      .onConflictDoUpdate({
        target: [dietPlanMeals.dietPlanId, dietPlanMeals.mealType],
        set: { content: data.content, orderIndex: data.orderIndex ?? 0 },
      })
      .returning();
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete("/diet-plans/:id/meals/:mealType", async (req, res, next) => {
  try {
    await db
      .delete(dietPlanMeals)
      .where(
        and(
          eq(dietPlanMeals.dietPlanId, req.params.id),
          eq(dietPlanMeals.mealType, req.params.mealType as any),
        ),
      );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Upsert a section block for a plan
router.put("/diet-plans/:id/sections/:sectionType", async (req, res, next) => {
  try {
    const data = insertDietPlanSectionSchema.parse({
      ...req.body,
      dietPlanId: req.params.id,
      sectionType: req.params.sectionType,
    });
    const [row] = await db
      .insert(dietPlanSections)
      .values(data)
      .onConflictDoUpdate({
        target: [dietPlanSections.dietPlanId, dietPlanSections.sectionType],
        set: { content: data.content },
      })
      .returning();
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete(
  "/diet-plans/:id/sections/:sectionType",
  async (req, res, next) => {
    try {
      await db
        .delete(dietPlanSections)
        .where(
          and(
            eq(dietPlanSections.dietPlanId, req.params.id),
            eq(dietPlanSections.sectionType, req.params.sectionType as any),
          ),
        );
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  },
);

export default router;
