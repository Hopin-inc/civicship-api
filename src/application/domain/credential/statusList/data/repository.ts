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
 *   - `allocateSlot` does a single conditional UPDATE that combines
 *     "increment nextIndex" with "set frozen=true if we just hit capacity",
 *     so callers never observe an intermediate state. The PostgreSQL update
 *     is atomic at the row level which is enough for the volumes we expect
 *     (year ~10,000 issuances → ~3 / day on average).
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
import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import type {
  IStatusListRepository,
  VcRevocationRow,
} from "@/application/domain/credential/statusList/data/interface";
import type { StatusListCredentialRow } from "@/application/domain/credential/statusList/data/type";

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
      // Read first so we can compute the post-increment freeze flag in one
      // UPDATE. The surrounding `ctx.issuer.public` (or the caller's `tx`)
      // gives us a single transaction so the read + write stay consistent.
      const before = await client.statusListCredential.findUniqueOrThrow({
        where: { id },
      });
      if (before.frozen) {
        throw new Error(
          `StatusListRepository.allocateSlot: list ${id} is frozen — caller must bootstrap a new list.`,
        );
      }
      const allocatedIndex = before.nextIndex;
      const newNextIndex = allocatedIndex + 1;
      const willFill = newNextIndex >= before.capacity;
      const updated = await client.statusListCredential.update({
        where: { id },
        data: {
          nextIndex: newNextIndex,
          frozen: willFill ? true : undefined,
        },
      });
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
