import { sql } from "drizzle-orm";
import {
  customType,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { staffRoleEnum, staffStatusEnum, supportChannelEnum } from "./enums";

const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

export const staff = pgTable(
  "staff",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    phone: text("phone").unique(),
    email: citext("email").unique(),
    role: staffRoleEnum("role").notNull(),
    status: staffStatusEnum("status").notNull().default("active"),
    /** For role="support" only: which client channel(s) this staffer handles. */
    supportChannel: supportChannelEnum("support_channel"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("idx_staff_role").on(t.role),
    index("idx_staff_status").on(t.status),
  ],
);

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;
