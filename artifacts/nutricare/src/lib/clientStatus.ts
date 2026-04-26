import type { Client, LifecycleStatus } from "../types";
import type { SavedDietPlan } from "../store/dietPlans";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (a: Date, b: Date) =>
  Math.floor((a.getTime() - b.getTime()) / MS_PER_DAY);

const STALE_DAYS = 7;
const NO_RESPONSE_DAYS = 14;
const RENEWAL_WINDOW_DAYS = 7;
const COMPLETED_GRACE_DAYS = 7;

export interface StatusInputs {
  planStartDate?: string;
  planEndDate?: string;
  lastActivityDate?: string;
  status?: Client["status"];
}

export function computeClientStatus(c: StatusInputs, now: Date = new Date()): LifecycleStatus {
  if (c.status === "Inactive") return "inactive";

  if (!c.planStartDate || !c.planEndDate) {
    return "plan_not_started";
  }

  const end = new Date(c.planEndDate);
  const lastActivity = c.lastActivityDate ? new Date(c.lastActivityDate) : new Date(c.planStartDate);

  const daysUntilEnd = daysBetween(end, now);
  const daysSinceEnd = -daysUntilEnd;
  const daysSinceActivity = daysBetween(now, lastActivity);

  if (daysSinceEnd > COMPLETED_GRACE_DAYS) return "inactive";
  if (daysSinceEnd >= 0) return "completed_30_days";
  if (daysUntilEnd <= RENEWAL_WINDOW_DAYS) return "renewal_due";
  if (daysSinceActivity >= NO_RESPONSE_DAYS) return "not_following_no_response";
  if (daysSinceActivity >= STALE_DAYS) return "few_days_then_stopped";
  return "active";
}

/**
 * Returns a Client decorated with a freshly computed lifecycleStatus and
 * the latest plan info merged in from the diet-plans store.
 * Falls back to existing legacy fields (renewalDate, latestPlanDate, lastUpdate)
 * so existing seeded data works without modification.
 */
export function enrichClient(c: Client, allPlans: SavedDietPlan[] = []): Client {
  const latest = allPlans
    .filter((p) => p.clientId === c.id && p.status === "Published")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

  const planStartDate =
    (latest && latest.createdAt.slice(0, 10)) ?? c.planStartDate ?? c.latestPlanDate;

  // If we have a fresh plan but no explicit end, default to +90 days from start
  let planEndDate = c.planEndDate ?? c.renewalDate;
  if (latest && (!c.planEndDate || c.planEndDate < latest.createdAt.slice(0, 10))) {
    const start = new Date(latest.createdAt);
    start.setDate(start.getDate() + 90);
    planEndDate = start.toISOString().slice(0, 10);
  }

  const lastActivityDate = c.lastActivityDate ?? c.lastUpdate ?? planStartDate;

  const lifecycleStatus = computeClientStatus({
    planStartDate,
    planEndDate,
    lastActivityDate,
    status: c.status,
  });

  return {
    ...c,
    planStartDate,
    planEndDate,
    lastActivityDate,
    lifecycleStatus,
    latestPlanId: latest?.id ?? c.latestPlanId,
    latestPlanDate: latest?.createdAt.slice(0, 10) ?? c.latestPlanDate,
  };
}
