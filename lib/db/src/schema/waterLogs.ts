import { sql } from "drizzle-orm";
import { date, index, numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { clients } from "./clients";

export const waterLogs = pgTable(
  "water_logs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    liters: numeric("liters", { precision: 3, scale: 1 }).notNull(),
    logDate: date("log_date").notNull().default(sql`CURRENT_DATE`),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  },
  (t) => [
    index("idx_water_logs_client_date").on(t.clientId, t.logDate),
  ],
);

export const insertWaterLogSchema = createInsertSchema(waterLogs).omit({
  id: true,
  createdAt: true,
});

export type WaterLog = typeof waterLogs.$inferSelect;
export type InsertWaterLog = typeof waterLogs.$inferInsert;
