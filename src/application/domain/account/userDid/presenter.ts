/**
 * `UserDidPresenter` — Prisma row → GraphQL type formatting for the User
 * DID domain.
 *
 * Phase 1 step 7 scope: skeleton only. The schema PR (#1094) introduces
 * the underlying Prisma model and the GraphQL schema PR (Phase 1 step 8)
 * introduces `GqlUserDidAnchor`. Until both land, the presenter exposes a
 * single passthrough so the upcoming resolver has a clear extension point
 * without leaking GraphQL types into the service layer.
 *
 * Pure functions only — no I/O, no DI, no business logic (per CLAUDE.md
 * "Layer Responsibilities" §6).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.1
 */

import type { UserDidAnchorRow } from "@/application/domain/account/userDid/data/type";

/**
 * Public-facing skeleton shape. Matches the field set the design's §5.4.4
 * `proof` block exposes, less the `proof` framing — that wrapping happens
 * in the resolver layer (PR #1096 already implements it for the HTTP
 * route). Once the GraphQL schema lands, swap the return type to
 * `GqlUserDidAnchor` and tighten the field names.
 */
export interface UserDidAnchorView {
  did: string;
  operation: UserDidAnchorRow["operation"];
  documentHash: string;
  network: UserDidAnchorRow["network"];
  status: UserDidAnchorRow["status"];
  chainTxHash: string | null;
  chainOpIndex: number | null;
  confirmedAt: string | null;
}

const UserDidPresenter = {
  /** Convert a single anchor row to its GraphQL-friendly view shape. */
  view(row: UserDidAnchorRow): UserDidAnchorView {
    return {
      did: row.did,
      operation: row.operation,
      documentHash: row.documentHash,
      network: row.network,
      status: row.status,
      chainTxHash: row.chainTxHash,
      chainOpIndex: row.chainOpIndex,
      confirmedAt: row.confirmedAt ? row.confirmedAt.toISOString() : null,
    };
  },
};

export default UserDidPresenter;
