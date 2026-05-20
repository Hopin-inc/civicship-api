/**
 * Prisma-backed repository for `StatusListCredential` (§4.1 / §5.2.4).
 *
 * The model lives in schema PR #1094 (already merged into the parent
 * `claude/did-vc-internalization-review-eptzS`). This repository wraps it
 * directly — no stub layer — because the parent branch's generated client
 * already has `StatusListCredential` available.
 *
 * Atomicity notes:
 *
 *   - `allocateSlot` issues a Prisma atomic-increment UPDATE
 *     (`nextIndex: { increment: 1 }`) under a `frozen=false` guard, so
 *     two concurrent allocators are serialised by Postgres' row lock and
 *     receive distinct `nextIndex` values. The previous read-then-write
 *     implementation under Read Committed was vulnerable to lost-update
 *     (two callers reading the same `nextIndex`, two writers persisting
 *     `value+1`); the atomic increment closes that gap without raising
 *     the isolation level. Capacity rollover surfaces as
 *     `CapacityReachedError` (caught at the service layer); a
 *     concurrently-frozen row surfaces as `StatusListFrozenError`
 *     (mapped from Prisma P2025).
 *
 *   - `updateBitstring` always re-writes the entire bytea blob. The design
 *     (§7.3 "Write amplification") accepts this overhead given expected
 *     revocation volume (< 100 / month). If that ever changes we'd switch
 *     to differential updates.
 *
 * RLS: status lists are public artefacts (anyone can fetch them via
 * `/credentials/status/:listKey.jwt`) so all queries run via
 * `ctx.issuer.public`.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (StatusListCredential schema)
 *   docs/report/did-vc-internalization.md §5.2.4 (this repository's surface)
 *   docs/report/did-vc-internalization.md §7     (Revocation lifecycle)
 */

import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import type {
  IStatusListRepository,
  VcRevocationRow,
} from "@/application/domain/credential/statusList/data/interface";
import type { StatusListCredentialRow } from "@/application/domain/credential/statusList/data/type";
import {
  CapacityReachedError,
  StatusListFrozenError,
} from "@/application/domain/credential/statusList/data/errors";

/**
 * The Prisma model exposes `encodedList` as `Bytes` which the runtime
 * surfaces as `Buffer`. Tests and downstream callers should treat it as
 * `Uint8Array`; this helper normalises the boundary at the read site.
 */
function toRow(record: {
  id: string;
  listKey: string;
  encodedList: Uint8Array | Buffer;
  vcJwt: string;
  nextIndex: number;
  capacity: number;
  frozen: boolean;
  updatedVersion: number;
  lastIssuedAt: Date;
  createdAt: Date;
  updatedAt: Date | null;
}): StatusListCredentialRow {
  const encodedList =
    record.encodedList instanceof Uint8Array
      ? record.encodedList
      : new Uint8Array(record.encodedList);
  return {
    id: record.id,
    listKey: record.listKey,
    encodedList,
    vcJwt: record.vcJwt,
    nextIndex: record.nextIndex,
    capacity: record.capacity,
    frozen: record.frozen,
    updatedVersion: record.updatedVersion,
    lastIssuedAt: record.lastIssuedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

@injectable()
export default class StatusListRepository implements IStatusListRepository {
  async findActive(
    ctx: IContext,
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow | null> {
    const run = async (client: Prisma.TransactionClient) => {
      const record = await client.statusListCredential.findFirst({
        where: { frozen: false },
        // Newest first so capacity-rollover bootstrap targets the live row.
        orderBy: { createdAt: "desc" },
      });
      return record ? toRow(record) : null;
    };
    if (tx) {
      return run(tx);
    }
    return ctx.issuer.public(ctx, run);
  }

  async findByListKey(
    ctx: IContext,
    listKey: string,
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow | null> {
    const run = async (client: Prisma.TransactionClient) => {
      const record = await client.statusListCredential.findUnique({
        where: { listKey },
      });
      return record ? toRow(record) : null;
    };
    if (tx) {
      return run(tx);
    }
    return ctx.issuer.public(ctx, run);
  }

  async findById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow | null> {
    const run = async (client: Prisma.TransactionClient) => {
      const record = await client.statusListCredential.findUnique({
        where: { id },
      });
      return record ? toRow(record) : null;
    };
    if (tx) {
      return run(tx);
    }
    return ctx.issuer.public(ctx, run);
  }

  async findMaxNumericListKey(
    ctx: IContext,
    tx?: Prisma.TransactionClient,
  ): Promise<number | null> {
    const run = async (client: Prisma.TransactionClient): Promise<number | null> => {
      // `list_key` is a TEXT column, but the writer (`computeNextListKey`)
      // only ever stores digit-only strings. Cast the digit-only subset
      // to INTEGER and take the MAX in a single round-trip — this
      // replaces the previous "walk 1..1024" scan that emitted up to
      // 1023 SELECTs and was racy under concurrent bootstrap.
      const rows = await client.$queryRaw<{ max: number | null }[]>`
        SELECT MAX(list_key::int) AS max
        FROM t_status_list_credentials
        WHERE list_key ~ '^[0-9]+$'
      `;
      const max = rows[0]?.max;
      return max == null ? null : Number(max);
    };
    if (tx) {
      return run(tx);
    }
    return ctx.issuer.public(ctx, run);
  }

  async create(
    ctx: IContext,
    input: {
      listKey: string;
      capacity: number;
      encodedList: Uint8Array;
      vcJwt: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow> {
    const run = async (client: Prisma.TransactionClient) => {
      const record = await client.statusListCredential.create({
        data: {
          listKey: input.listKey,
          capacity: input.capacity,
          encodedList: Buffer.from(input.encodedList),
          vcJwt: input.vcJwt,
          // nextIndex / frozen / updatedVersion default to 0 / false / 0.
        },
      });
      return toRow(record);
    };
    if (tx) {
      return run(tx);
    }
    return ctx.issuer.public(ctx, run);
  }

  async allocateSlot(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ row: StatusListCredentialRow; allocatedIndex: number }> {
    const run = async (
      client: Prisma.TransactionClient,
    ): Promise<{ row: StatusListCredentialRow; allocatedIndex: number }> => {
      // Atomic increment under a "frozen=false" guard. Postgres takes a row
      // lock during UPDATE so two concurrent issuers cannot observe the
      // same `nextIndex`; whichever loses the race either gets a different
      // (incremented) value back or — if the row froze first — sees P2025
      // (record-not-found-for-where-clause) which we map to
      // `StatusListFrozenError`.
      //
      // We deliberately do NOT pre-`SELECT … FOR UPDATE` the row before
      // updating: the previous implementation read first and wrote second
      // under Read Committed, which leaves the well-known lost-update gap
      // (two readers see the same `nextIndex`, two writers store the same
      // value+1). The atomic increment closes that gap without raising the
      // isolation level.
      let updated: Prisma.StatusListCredentialGetPayload<true>;
      try {
        updated = await client.statusListCredential.update({
          where: { id, frozen: false },
          data: { nextIndex: { increment: 1 } },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
          // Either the row id is unknown or it was already frozen by a
          // concurrent allocator. We can't tell from P2025 alone, so we
          // surface the recoverable failure mode (frozen) — `findById` is
          // cheap if the service ever needs to disambiguate.
          throw new StatusListFrozenError(id);
        }
        throw e;
      }

      const allocatedIndex = updated.nextIndex - 1;

      // Two outcomes after the atomic increment:
      //
      //   (a) `allocatedIndex >= capacity` — we lost a race past capacity.
      //       Our increment is invalid (the row is now over-allocated by
      //       one). Freeze the row so further allocators bail out, then
      //       throw `CapacityReachedError` so the service rolls into a
      //       fresh list. The over-allocation is harmless: the bitstring
      //       column never indexes past `capacity-1`, and the column is
      //       only consulted for the next allocator's "is this row at
      //       capacity?" check (which now short-circuits via `frozen`).
      //
      //   (b) `allocatedIndex == capacity - 1` — we just consumed the
      //       last legitimate slot. Freeze the row in the same
      //       transaction so subsequent `findActive` skips it. The slot
      //       is still returned to the caller (it is a valid index).
      if (allocatedIndex >= updated.capacity) {
        await client.statusListCredential.update({
          where: { id },
          data: { frozen: true },
        });
        throw new CapacityReachedError(updated.listKey);
      }

      if (allocatedIndex === updated.capacity - 1) {
        updated = await client.statusListCredential.update({
          where: { id },
          data: { frozen: true },
        });
      }

      return { row: toRow(updated), allocatedIndex };
    };
    if (tx) {
      return run(tx);
    }
    return ctx.issuer.public(ctx, run);
  }

  async updateBitstring(
    ctx: IContext,
    id: string,
    input: { encodedList: Uint8Array; vcJwt: string },
    tx?: Prisma.TransactionClient,
  ): Promise<StatusListCredentialRow> {
    const run = async (client: Prisma.TransactionClient) => {
      const updated = await client.statusListCredential.update({
        where: { id },
        data: {
          encodedList: Buffer.from(input.encodedList),
          vcJwt: input.vcJwt,
          updatedVersion: { increment: 1 },
          lastIssuedAt: new Date(),
        },
      });
      return toRow(updated);
    };
    if (tx) {
      return run(tx);
    }
    return ctx.issuer.public(ctx, run);
  }

  async findVcRequest(
    ctx: IContext,
    vcRequestId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<VcRevocationRow | null> {
    const run = async (client: Prisma.TransactionClient) => {
      const record = await client.vcIssuanceRequest.findUnique({
        where: { id: vcRequestId },
        select: { id: true, statusListIndex: true, statusListCredential: true },
      });
      return record;
    };
    if (tx) {
      return run(tx);
    }
    return ctx.issuer.public(ctx, run);
  }

  async markVcRevoked(
    ctx: IContext,
    vcRequestId: string,
    input: { reason?: string },
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const run = async (client: Prisma.TransactionClient) => {
      // Revocation is recorded via the `revokedAt` / `revocationReason`
      // columns; the `VcIssuanceStatus` enum (§4.1) currently has no
      // `REVOKED` member, and adding one belongs to a schema PR. The VC's
      // anchor / issuance lifecycle stays intact (still `COMPLETED`) — VPs
      // and verifiers learn about revocation via the StatusList JWT, not
      // via the issuance row's `status` column.
      //
      // TODO(schema-followup): once the schema PR introduces
      // `VcIssuanceStatus.REVOKED`, also flip `status = REVOKED` here so
      // back-office queries can filter without joining `revokedAt IS NOT
      // NULL`. The StatusList bit remains the source of truth for the
      // verifier-facing flow regardless. Tracked alongside the schema
      // PR (#1094 follow-up); intentionally out of scope for this PR.
      await client.vcIssuanceRequest.update({
        where: { id: vcRequestId },
        data: {
          revokedAt: new Date(),
          revocationReason: input.reason ?? null,
        },
      });
    };
    if (tx) {
      await run(tx);
      return;
    }
    await ctx.issuer.public(ctx, run);
  }
}
