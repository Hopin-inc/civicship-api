/**
 * Repository contract for the `credential/statusList` application domain.
 *
 * The surface is narrow — only the operations the StatusListService (§5.2.4)
 * needs are exposed:
 *   - `findActive`      : pick the latest non-frozen list (or null bootstrap).
 *   - `findByListKey`   : public endpoint lookup.
 *   - `findById`        : internal lookup by primary key.
 *   - `create`          : bootstrap a new list with an empty bitstring.
 *   - `allocateSlot`    : atomically increment `nextIndex`; freeze on capacity.
 *   - `updateBitstring` : flip a revocation bit + bump `updatedVersion`.
 *   - `findVcRequest`   : resolve the VC row for revocation (read-only).
 *   - `markVcRevoked`   : stamp the VC row with `revokedAt` + reason.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (StatusListCredential schema)
 *   docs/report/did-vc-internalization.md §5.2.4 (Application service shape)
 *   docs/report/did-vc-internalization.md §7     (Revocation lifecycle)
 */

import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import type { StatusListCredentialRow } from "@/application/domain/credential/statusList/data/type";

/**
 * Subset of `VcIssuanceRequest` needed for revocation. Kept narrow so the
 * StatusList domain doesn't accidentally depend on the full VC issuance
 * row shape.
 */
export interface VcRevocationRow {
  id: string;
  statusListIndex: number | null;
  statusListCredential: string | null;
}

export interface IStatusListRepository {
  /**
   * Returns the latest non-frozen list, or `null` if none exists yet.
   * Ordered by `createdAt DESC` so the freshest active row wins.
   */
  findActive(ctx: IContext, tx?: Prisma.TransactionClient): Promise<StatusListCredentialRow | null>;

  /** Public endpoint lookup by the URL path segment. */
  findByListKey(
    ctx: IContext,
    listKey: string,
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow | null>;

  /** Internal lookup by primary key (cuid). */
  findById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow | null>;

  /**
   * Bootstrap a new list (§5.2.4 — when `findActive` returns null or the
   * active list is full). The caller supplies the `listKey` (next sequence
   * number) and the empty bitstring; the JWT is filled in by the service
   * after construction.
   */
  create(
    ctx: IContext,
    input: {
      listKey: string;
      capacity: number;
      encodedList: Uint8Array;
      vcJwt: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow>;

  /**
   * Atomically reserve the next bit index. Returns the row with `nextIndex`
   * already incremented. When the post-increment count reaches `capacity`,
   * the row is also marked `frozen=true` in the same UPDATE (so subsequent
   * `findActive` calls skip it).
   */
  allocateSlot(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ row: StatusListCredentialRow; allocatedIndex: number }>;

  /**
   * Persist a revoked-bit update + the freshly re-signed list VC JWT.
   * Bumps `updatedVersion` and `lastIssuedAt`.
   */
  updateBitstring(
    ctx: IContext,
    id: string,
    input: { encodedList: Uint8Array; vcJwt: string },
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow>;

  /** Read the VC issuance row needed to revoke. */
  findVcRequest(
    ctx: IContext,
    vcRequestId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<VcRevocationRow | null>;

  /** Stamp `revokedAt = now` (and optional reason) on the VC row. */
  markVcRevoked(
    ctx: IContext,
    vcRequestId: string,
    input: { reason?: string },
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
}
