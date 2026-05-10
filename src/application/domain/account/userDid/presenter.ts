/**
 * `UserDidPresenter` — Prisma row → GraphQL type formatting for the User
 * DID domain.
 *
 * Phase 1 step 8 scope: GraphQL schema (`UserDidAnchor`) lands in this PR,
 * so the presenter now produces `GqlUserDidAnchor`. Strategy A still
 * applies: the input row is the local `UserDidAnchorRow`, which the
 * cleanup PR (`claude/phase1-strategy-a-cleanup`) will replace with the
 * Prisma-generated `UserDidAnchor` model in one move. Field names line up
 * one-for-one so the swap is mechanical.
 *
 * Pure functions only — no I/O, no DI, no business logic (per CLAUDE.md
 * "Layer Responsibilities" §6).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.1
 *   docs/report/did-vc-internalization.md §4.1 (UserDidAnchor schema)
 */

import type { GqlUserDidAnchor } from "@/types/graphql";
import type { UserDidAnchorRow } from "@/application/domain/account/userDid/data/type";

const UserDidPresenter = {
  /**
   * Convert a single anchor row to its GraphQL type.
   *
   * The local row's `operation` / `status` / `network` are already
   * exact-string unions matching the GraphQL enum string values, so the
   * conversion is a structural projection — no runtime mapping needed.
   *
   * `userId` is forwarded onto the returned object even though it is not
   * part of the surface GraphQL `UserDidAnchor` type (Phase 1.5): the
   * `UserDidAnchor.user` field resolver reads `parent.userId` and hands
   * it to the user DataLoader. Carrying the foreign key here lets the
   * field resolver stay pure / N+1-safe without re-querying the row in
   * the resolver layer. We cast through `unknown` so callers receive the
   * declared `GqlUserDidAnchor` shape and TypeScript still flags missing
   * schema fields, while runtime callers can read `userId` off the
   * resolver `parent` argument.
   */
  view(row: UserDidAnchorRow): GqlUserDidAnchor {
    return {
      __typename: "UserDidAnchor",
      id: row.id,
      did: row.did,
      operation: row.operation,
      documentHash: row.documentHash,
      network: row.network,
      chainTxHash: row.chainTxHash,
      chainOpIndex: row.chainOpIndex,
      status: row.status,
      confirmedAt: row.confirmedAt,
      createdAt: row.createdAt,
      // Carry userId for the field resolver. Cast keeps the public return
      // type aligned with the GraphQL schema.
      userId: row.userId,
    } as unknown as GqlUserDidAnchor;
  },
};

export default UserDidPresenter;
