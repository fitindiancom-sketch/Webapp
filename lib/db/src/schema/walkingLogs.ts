import { sql } from "drizzle-orm";
import { date, index, integer, numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { clients } from "./clients";

export const walkingLogs = pgTable(
  "walking_logs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    steps: integer("steps").notNull(),
    distanceKm: numeric("distance_km", { precision: 8, scale: 3 }),
    calories: integer("calories"),
    durationSec: integer("duration_sec").notNull(),
    logDate: date("log_date").notNull().default(sql`CURRENT_DATE`),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("walking_logs_client_date").on(t.clientId, t.logDate),
  ],
);

export const insertWalkingLogSchema = createInsertSchema(walkingLogs).omit({
  id: true,
  createdAt: true,
});

export type WalkingLog = typeof walkingLogs.$inferSelect;
export type InsertWalkingLog = typeof walkingLogs.$inferInsert;
