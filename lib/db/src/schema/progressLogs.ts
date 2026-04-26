import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { clients } from "./clients";

export const progressLogs = pgTable(
  "progress_logs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("idx_progress_logs_client_id").on(t.clientId),
    index("idx_progress_logs_created_at").on(t.createdAt.desc()),
    index("idx_progress_logs_client_date").on(t.clientId, t.createdAt.desc()),
  ],
);

export const insertProgressLogSchema = createInsertSchema(progressLogs).omit({
  id: true,
  createdAt: true,
});

export type ProgressLog = typeof progressLogs.$inferSelect;
export type InsertProgressLog = typeof progressLogs.$inferInsert;
