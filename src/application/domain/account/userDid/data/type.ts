/**
 * Type declarations for the `userDid` application domain.
 *
 * `UserDidAnchorRow` aliases the generated `UserDidAnchor` Prisma model so
 * the repository can return raw `findFirst` / `create` results without an
 * adapter, and so `IUserDidAnchorRepository` and `UserDidAnchorStore`
 * (resolver) agree on the row shape.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1 (UserDidAnchor schema)
 *   docs/report/did-vc-internalization.md §5.2.1 (Application service shape)
 */

import type { ChainNetwork, DidOperation, AnchorStatus } from "@prisma/client";
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

// Re-export the underlying Prisma enums for callers that prefer the
// canonical names (e.g. when writing `Prisma.UserDidAnchorCreateInput`-shaped
// data).
export type { ChainNetwork, DidOperation, AnchorStatus };

/**
 * Input for creating a new CREATE-op `UserDidAnchor` row.
 *
 * Mirrors the columns inserted by `UserDidAnchorRepository.createCreate`.
 * Chain tx fields (`chainTxHash`, `chainOpIndex`, `confirmedAt`) are filled
 * in later by the anchor batch service.
 */
export interface CreateUserDidAnchorInput {
  userId: string;
  did: string;
  documentHash: string;
  documentCbor: Uint8Array;
  /** Defaults to `"CARDANO_MAINNET"` per §5.2.1 example when omitted. */
  network?: AnchorNetworkValue;
  /**
   * Anchor id of the prior DID version — links the on-chain hash chain
   * (§5.1.6). Left undefined for the genesis CREATE op (no predecessor);
   * UPDATE / DEACTIVATE callers populate it with the user's latest anchor.
   */
  previousAnchorId?: string;
}

/**
 * Input for an UPDATE-op anchor row. Reuses the CREATE shape — the only
 * semantic difference is `operation = "UPDATE"`, which the repository sets
 * internally.
 */
export type UpdateUserDidAnchorInput = CreateUserDidAnchorInput;

/**
 * Input for a DEACTIVATE-op anchor row. `documentCbor` is null per §E
 * (tombstone documents are reconstructed by the resolver), and
 * `documentHash` references the tombstone document hash.
 */
export interface DeactivateUserDidAnchorInput {
  userId: string;
  did: string;
  documentHash: string;
  network?: AnchorNetworkValue;
  /**
   * Anchor id of the prior DID version. The DEACTIVATE op's on-chain
   * `prev` is mandatory (§5.1.6), so this is **required** — a DID with no
   * prior anchor cannot be deactivated. `UserDidService.deactivateDid`
   * resolves it from the user's latest anchor and throws when absent.
   */
  previousAnchorId: string;
}
