/**
 * Domain errors for the `credential/statusList` data layer.
 *
 * These are typed exceptions emitted by the repository so the service
 * layer can branch on the failure mode without sniffing message strings.
 *
 * Why repository-layer errors and not service-layer:
 *   `allocateSlot` and bootstrap creation are inherently racy at the SQL
 *   level (atomic increments + unique constraints), so the conditions are
 *   detectable only at the data boundary. The service layer translates
 *   them into the higher-level "rollover into a fresh list" / "retry the
 *   bootstrap" decisions.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.4 (StatusList service)
 *   docs/report/did-vc-internalization.md §7     (Revocation lifecycle)
 */

/**
 * Thrown by `allocateSlot` when the targeted list reaches capacity. The
 * service catches this and bootstraps a fresh list before recursing.
 *
 * Carries the `listKey` so production alarms can attribute the rollover
 * to the right list (operationally interesting once we're past the first
 * list — every rollover is a once-in-13-years event per §7.3 sizing).
 */
export class CapacityReachedError extends Error {
  readonly listKey: string;
  constructor(listKey: string) {
    super(`StatusList ${listKey} reached capacity — caller must rollover.`);
    this.name = "CapacityReachedError";
    this.listKey = listKey;
  }
}

/**
 * Thrown by `allocateSlot` when the target row is already frozen — either
 * because a concurrent allocator just hit capacity or because someone
 * called `findActive` on a stale snapshot. Both cases are recoverable by
 * re-running `findActive`; the service layer treats this as a retry signal.
 */
export class StatusListFrozenError extends Error {
  readonly listId: string;
  constructor(listId: string) {
    super(`StatusList ${listId} is already frozen — caller must re-resolve active list.`);
    this.name = "StatusListFrozenError";
    this.listId = listId;
  }
}
