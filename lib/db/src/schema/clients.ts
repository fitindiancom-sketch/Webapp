import { sql } from "drizzle-orm";
import {
  check,
  customType,
  date,
  index,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import {
  clientStatusEnum,
  dietTypeEnum,
  genderEnum,
  registrationTypeEnum,
} from "./enums";
import { staff } from "./staff";

const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientCode: text("client_code").notNull().unique(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: citext("email"),
    city: text("city").notNull(),
    age: smallint("age"),
    gender: genderEnum("gender"),
    heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    goalWeightKg: numeric("goal_weight_kg", { precision: 5, scale: 2 }),
    lifestyle: text("lifestyle"),
    medicalNotes: text("medical_notes"),
    dietType: dietTypeEnum("diet_type").notNull().default("veg"),
    assignedDietitianId: uuid("assigned_dietitian_id").references(
      () => staff.id,
      { onDelete: "set null" },
    ),
    assignedSupportId: uuid("assigned_support_id").references(() => staff.id, {
      onDelete: "set null",
    }),
    registrationType: registrationTypeEnum("registration_type")
      .notNull()
      .default("online"),
    avatarUrl: text("avatar_url"),
    status: clientStatusEnum("status")
      .notNull()
      .default("plan_not_started"),
    planStartDate: date("plan_start_date"),
    planEndDate: date("plan_end_date"),
    lastActivityDate: date("last_activity_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check(
      "chk_plan_window",
      sql`${t.planEndDate} IS NULL OR ${t.planStartDate} IS NULL OR ${t.planEndDate} >= ${t.planStartDate}`,
    ),
    index("idx_clients_status").on(t.status),
    index("idx_clients_dietitian").on(t.assignedDietitianId),
    index("idx_clients_support").on(t.assignedSupportId),
    index("idx_clients_city").on(t.city),
    index("idx_clients_registration_type").on(t.registrationType),
    index("idx_clients_plan_end_date").on(t.planEndDate),
    index("idx_clients_last_activity_date").on(t.lastActivityDate),
    index("idx_clients_created_at").on(t.createdAt.desc()),
    index("idx_clients_phone").on(t.phone),
  ],
);

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
