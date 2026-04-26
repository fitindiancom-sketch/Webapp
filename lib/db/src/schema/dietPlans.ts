import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { mealTypeEnum, planSectionEnum, planStatusEnum } from "./enums";
import { clients } from "./clients";
import { staff } from "./staff";

export const dietPlans = pgTable(
  "diet_plans",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    planCode: text("plan_code").notNull().unique(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    dietitianId: uuid("dietitian_id").references(() => staff.id, {
      onDelete: "set null",
    }),
    planName: text("plan_name").notNull(),
    goalWeightKg: numeric("goal_weight_kg", { precision: 5, scale: 2 }),
    waterGoalL: numeric("water_goal_l", { precision: 4, scale: 1 }).default("3.0"),
    status: planStatusEnum("status").notNull().default("draft"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check(
      "chk_dp_window",
      sql`${t.endDate} IS NULL OR ${t.startDate} IS NULL OR ${t.endDate} >= ${t.startDate}`,
    ),
    index("idx_diet_plans_client_id").on(t.clientId),
    index("idx_diet_plans_dietitian_id").on(t.dietitianId),
    index("idx_diet_plans_status").on(t.status),
    index("idx_diet_plans_created_at").on(t.createdAt.desc()),
  ],
);

export const dietPlanMeals = pgTable(
  "diet_plan_meals",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    dietPlanId: uuid("diet_plan_id")
      .notNull()
      .references(() => dietPlans.id, { onDelete: "cascade" }),
    mealType: mealTypeEnum("meal_type").notNull(),
    content: text("content").notNull(),
    orderIndex: smallint("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    unique("uq_plan_meal").on(t.dietPlanId, t.mealType),
    index("idx_diet_plan_meals_plan").on(t.dietPlanId, t.orderIndex),
  ],
);

export const dietPlanSections = pgTable(
  "diet_plan_sections",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    dietPlanId: uuid("diet_plan_id")
      .notNull()
      .references(() => dietPlans.id, { onDelete: "cascade" }),
    sectionType: planSectionEnum("section_type").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    unique("uq_plan_section").on(t.dietPlanId, t.sectionType),
    index("idx_diet_plan_sections_plan").on(t.dietPlanId),
  ],
);

export const insertDietPlanSchema = createInsertSchema(dietPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertDietPlanMealSchema = createInsertSchema(dietPlanMeals).omit({
  id: true,
  createdAt: true,
});
export const insertDietPlanSectionSchema = createInsertSchema(
  dietPlanSections,
).omit({ id: true, createdAt: true });

export type DietPlan = typeof dietPlans.$inferSelect;
export type InsertDietPlan = typeof dietPlans.$inferInsert;
export type DietPlanMeal = typeof dietPlanMeals.$inferSelect;
export type InsertDietPlanMeal = typeof dietPlanMeals.$inferInsert;
export type DietPlanSection = typeof dietPlanSections.$inferSelect;
export type InsertDietPlanSection = typeof dietPlanSections.$inferInsert;
