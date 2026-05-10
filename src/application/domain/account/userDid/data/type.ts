/**
 * Local type declarations for the `userDid` application domain.
 *
 * Strategy A note (Phase 1 step 7) ----------------------------------------
 *
 * The `t_user_did_anchors` Prisma model lives in a sibling PR
 * (`claude/phase1-schema-migration`, #1094) which has not yet merged. To keep
 * this PR independent we re-export the row shape declared by the resolver
 * (PR #1096, `src/infrastructure/libs/did/didDocumentResolver.ts`) so the
 * service / repository layer can be built against a stable contract.
 *
 * After the schema PR merges, the swap is a one-line change:
 *
 *     // TODO(phase1-final): replace with
 *     //   import type { UserDidAnchor } from "@prisma/client";
 *     //   export type UserDidAnchorRow = UserDidAnchor;
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1 (UserDidAnchor schema)
 *   docs/report/did-vc-internalization.md §5.2.1 (Application service shape)
 */

import type {
  AnchorNetworkValue,
  AnchorStatusValue,
  DidOperationValue,
  UserDidAnchorRow as InfraUserDidAnchorRow,
} from "@/infrastructure/libs/did/didDocumentResolver";

// Re-export so callers in this domain do not need to reach into infrastructure.
export type { AnchorNetworkValue, AnchorStatusValue, DidOperationValue };

/**
 * Domain-level row shape for `UserDidAnchor`.
 *
 * Strategy A note (Phase 1 step 8): the infrastructure-level
 * `UserDidAnchorRow` (in `didDocumentResolver`) only declares fields the
 * resolver needs. The GraphQL schema exposes `id`, `userId`, and `createdAt`
 * too, so we widen the row here without touching the infra-side type. The
 * cleanup PR (`claude/phase1-strategy-a-cleanup`) will replace this with
 * the Prisma-generated `UserDidAnchor` model in one move.
 */
export interface UserDidAnchorRow extends InfraUserDidAnchorRow {
  id: string;
  userId: string;
  createdAt: Date;
}

/**
 * Input for creating a new CREATE-op `UserDidAnchor` row.
 *
 * Mirrors the columns the schema PR will introduce in `t_user_did_anchors`.
 * Only the fields the service needs at row insertion time are listed; chain
 * tx fields (`chainTxHash`, `chainOpIndex`, `confirmedAt`) are filled in
 * later by the anchor batch service.
 */
export interface CreateUserDidAnchorInput {
  userId: string;
  did: string;
  documentHash: string;
  documentCbor: Uint8Array;
  /** Defaults to `"CARDANO_MAINNET"` per §5.2.1 example when omitted. */
  network?: AnchorNetworkValue;
}

/**
 * Input for an UPDATE-op anchor row. Reuses the CREATE shape — the only
 * semantic difference is `operation = "UPDATE"`, which the repository sets
 * internally.
 */
export type UpdateUserDidAnchorInput = CreateUserDidAnchorInput;

/**
 * Input for a DEACTIVATE-op anchor row. `documentCbor` is null per §E
 * (Tombstone documents are reconstructed from the tombstone builder, not
 * from CBOR), and `documentHash` references the tombstone document hash.
 */
export interface DeactivateUserDidAnchorInput {
  userId: string;
  did: string;
  documentHash: string;
  network?: AnchorNetworkValue;
}
