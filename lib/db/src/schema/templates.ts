import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { templateCategoryEnum } from "./enums";
import { staff } from "./staff";

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    category: templateCategoryEnum("category").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdBy: uuid("created_by").references(() => staff.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("idx_templates_category").on(t.category),
    index("idx_templates_title").on(t.title),
  ],
);

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
