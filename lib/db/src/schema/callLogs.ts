import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { clients } from "./clients";
import { staff } from "./staff";

export const callLogs = pgTable(
  "call_logs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    callStatus: text("call_status").notNull(),
    callDate: date("call_date").notNull().default(sql`CURRENT_DATE`),
    callTime: timestamp("call_time", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    durationSeconds: integer("duration_seconds").default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (t) => [
    index("idx_call_logs_staff_id").on(t.staffId),
    index("idx_call_logs_call_date").on(t.callDate),
    index("idx_call_logs_staff_date").on(t.staffId, t.callDate),
  ]
);

export const insertCallLogSchema = createInsertSchema(callLogs).omit({
  id: true,
  createdAt: true,
});

export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = typeof callLogs.$inferInsert;
