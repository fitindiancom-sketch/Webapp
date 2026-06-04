import { sql } from "drizzle-orm";
import { boolean, index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { photoMealEnum } from "./enums";
import { clients } from "./clients";
import { dietPlans } from "./dietPlans";

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    photoUrl: text("photo_url").notNull(),
    mealType: photoMealEnum("meal_type").notNull().default("other"),
    remarks: text("remarks"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    dietPlanId: uuid("diet_plan_id").references(() => dietPlans.id, {
      onDelete: "set null",
    }),
    dayNumber: smallint("day_number"),
    isOnTime: boolean("is_on_time").default(true),
  },
  (t) => [
    index("idx_photos_client_id").on(t.clientId),
    index("idx_photos_uploaded_at").on(t.uploadedAt.desc()),
    index("idx_photos_meal_type").on(t.mealType),
  ],
);

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;
