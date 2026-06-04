import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { photos } from "./photos";
import { staff } from "./staff";

export const photoComments = pgTable("photo_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  photoId: uuid("photo_id")
    .notNull()
    .references(() => photos.id, { onDelete: "cascade" }),
  staffId: uuid("staff_id").references(() => staff.id, { onDelete: "set null" }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  readAt: timestamp("read_at", { withTimezone: true }),
});

export const insertPhotoCommentSchema = createInsertSchema(photoComments).omit({
  id: true,
  createdAt: true,
});

export type PhotoComment = typeof photoComments.$inferSelect;
export type InsertPhotoComment = typeof photoComments.$inferInsert;
