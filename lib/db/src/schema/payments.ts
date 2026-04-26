import { sql } from "drizzle-orm";
import {
  char,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { paymentStatusEnum } from "./enums";
import { clients } from "./clients";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: char("currency", { length: 3 }).notNull().default("INR"),
    paymentDate: date("payment_date").notNull().default(sql`CURRENT_DATE`),
    planDurationDays: integer("plan_duration_days").notNull(),
    renewalDueDate: date("renewal_due_date").notNull(),
    status: paymentStatusEnum("status").notNull().default("paid"),
    reference: text("reference"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("idx_payments_client_id").on(t.clientId),
    index("idx_payments_status").on(t.status),
    index("idx_payments_renewal_due_date").on(t.renewalDueDate),
    index("idx_payments_payment_date").on(t.paymentDate.desc()),
  ],
);

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
