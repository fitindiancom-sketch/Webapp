import { pgEnum } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender_t", ["male", "female", "other"]);

export const dietTypeEnum = pgEnum("diet_type_t", [
  "veg",
  "non_veg",
  "eggetarian",
  "vegan",
]);

export const registrationTypeEnum = pgEnum("registration_type_t", [
  "online",
  "visit",
  "pune_visit",
]);

export const clientStatusEnum = pgEnum("client_status_t", [
  "plan_not_started",
  "active",
  "completed_30_days",
  "few_days_then_stopped",
  "not_following_no_response",
  "renewal_due",
  "inactive",
]);

export const staffRoleEnum = pgEnum("staff_role_t", [
  "dietitian",
  "support",
  "admin",
  "super_admin",
]);

export const staffStatusEnum = pgEnum("staff_status_t", ["active", "inactive"]);

/**
 * For staff with role="support", which client channel(s) they handle.
 * Drives auto-assignment of new clients to the right team:
 *   - "online"     → handles clients registered online
 *   - "visit"      → handles office-visit clients
 *   - "pune_visit" → handles Pune-specific office visits
 *   - "all"        → support lead / generalist (catch-all fallback)
 * NULL on non-support roles.
 */
export const supportChannelEnum = pgEnum("support_channel_t", [
  "online",
  "visit",
  "pune_visit",
  "all",
]);

export const planStatusEnum = pgEnum("plan_status_t", [
  "draft",
  "active",
  "completed",
  "archived",
]);

export const mealTypeEnum = pgEnum("meal_type_t", [
  "morning",
  "breakfast",
  "mid_meal",
  "lunch",
  "evening",
  "tea_time",
  "dinner",
  "optional",
]);

export const planSectionEnum = pgEnum("plan_section_t", [
  "must_do",
  "vegetables",
  "fruits",
  "water",
]);

export const templateCategoryEnum = pgEnum("template_category_t", [
  "morning",
  "breakfast",
  "mid_meal",
  "lunch",
  "evening",
  "tea_time",
  "dinner",
  "must_do",
  "instructions",
  "vegetables",
  "fruits",
]);

export const photoMealEnum = pgEnum("photo_meal_t", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "other",
]);

export const paymentStatusEnum = pgEnum("payment_status_t", [
  "paid",
  "pending",
  "failed",
  "refunded",
]);
