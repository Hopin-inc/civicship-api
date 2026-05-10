/**
 * `StatusListPresenter` — Prisma row → public-facing DTO formatting for
 * the StatusList domain.
 *
 * Phase 1 step 8 scope: minimal. The only consumer today is the REST
 * endpoint which returns the raw VC JWT (a string) — the presenter is
 * here to keep the architecture symmetric with sibling domains and to
 * give the upcoming admin GraphQL mutation (Phase 1 step 10) a place to
 * land without a layer rewrite.
 *
 * Pure functions only — no I/O, no DI, no business logic.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.4
 *   CLAUDE.md "Layer Responsibilities" §6 (Presenter)
 */

import type {
  AllocatedSlot,
  StatusListCredentialRow,
} from "@/application/domain/credential/statusList/data/type";

/** Public view of a `StatusListCredential` (admin / debug surface). */
export interface StatusListView {
  id: string;
  listKey: string;
  capacity: number;
  nextIndex: number;
  frozen: boolean;
  updatedVersion: number;
  lastIssuedAt: string;
  createdAt: string;
}

const StatusListPresenter = {
  view(row: StatusListCredentialRow): StatusListView {
    return {
      id: row.id,
      listKey: row.listKey,
      capacity: row.capacity,
      nextIndex: row.nextIndex,
      frozen: row.frozen,
      updatedVersion: row.updatedVersion,
      lastIssuedAt: row.lastIssuedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  },

  /**
   * Project the slot allocation result for callers that don't need the
   * full row. Identity today; carved out so future fields (e.g. expiry)
   * can be added without touching `AllocatedSlot`'s consumers.
   */
  slot(allocation: AllocatedSlot): AllocatedSlot {
    return { ...allocation };
  },
};

export default StatusListPresenter;
