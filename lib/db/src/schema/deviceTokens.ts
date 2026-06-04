import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { clients } from "./clients";

export const deviceTokens = pgTable(
  "device_tokens",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    expoPushToken: text("expo_push_token").notNull(),
    platform: text("platform"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`,
    ),
  },
  (t) => [unique("device_tokens_client_token_unique").on(t.clientId, t.expoPushToken)],
);

export const insertDeviceTokenSchema = createInsertSchema(deviceTokens).omit({
  id: true,
  createdAt: true,
});

export type DeviceToken = typeof deviceTokens.$inferSelect;
export type InsertDeviceToken = typeof deviceTokens.$inferInsert;
