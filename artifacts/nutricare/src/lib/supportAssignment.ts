import type { Client, Role, Staff } from "../types";

/**
 * Map a client's registration channel to the support roles that can serve it.
 * The order matters: we try the first role first; if no active staff exist
 * we walk down the fallback chain. "Support Lead" is always a last resort
 * because the lead can pick up any channel when teams are short-staffed.
 */
const CHANNEL_TO_ROLES: Record<Client["registrationType"], readonly Role[]> = {
  Online: ["Online Support", "Support Lead"],
  Visit: ["Visit Support", "Support Lead"],
  "Pune Visit": ["Pune Visit Support", "Visit Support", "Support Lead"],
};

export interface SupportPick {
  /** The chosen staff member's id, or null if nobody is available. */
  staffId: string | null;
  /** The full staff record, for showing the dietitian who got picked. */
  staff: Staff | null;
  /** Why this pick was made — used for the "Assigned to" hint in the UI. */
  reason: string;
}

/**
 * Pick the best support staff for a new client of a given registration type.
 *
 * The rule is: among **active** staff whose role matches the channel,
 * pick the one with the **fewest currently-assigned non-inactive clients**.
 * That naturally load-balances new clients across the team without the
 * dietitian having to think about it.
 *
 * Inactive staff are skipped. Inactive clients don't count toward load
 * (they're not actually being served any more). Ties break by joinDate
 * (more senior staff get the new client first).
 */
export function pickSupportStaff(
  registrationType: Client["registrationType"],
  allStaff: Staff[],
  allClients: Client[],
): SupportPick {
  const candidateRoles = CHANNEL_TO_ROLES[registrationType] ?? [];

  for (const role of candidateRoles) {
    const candidates = allStaff.filter(
      (s) => s.role === role && s.status === "Active",
    );
    if (candidates.length === 0) continue;

    const loadByStaffId = countActiveLoad(allClients);

    candidates.sort((a, b) => {
      const la = loadByStaffId.get(a.id) ?? 0;
      const lb = loadByStaffId.get(b.id) ?? 0;
      if (la !== lb) return la - lb;
      // Older joinDate (more senior) wins ties — string compare on YYYY-MM-DD
      // works because the format sorts lexicographically.
      return a.joinDate.localeCompare(b.joinDate);
    });

    const picked = candidates[0];
    const isFallback = role !== candidateRoles[0];
    return {
      staffId: picked.id,
      staff: picked,
      reason: isFallback
        ? `No active ${candidateRoles[0]} found — assigned to ${role} as fallback.`
        : `Auto-assigned to the least-loaded ${role}.`,
    };
  }

  return {
    staffId: null,
    staff: null,
    reason: `No active support staff available for ${registrationType} clients.`,
  };
}

function countActiveLoad(clients: Client[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of clients) {
    if (c.lifecycleStatus === "inactive") continue;
    if (!c.supportStaffId) continue;
    counts.set(c.supportStaffId, (counts.get(c.supportStaffId) ?? 0) + 1);
  }
  return counts;
}
