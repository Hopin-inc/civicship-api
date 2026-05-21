/**
 * Integration tests for `StatusListRepository` (Phase 1.5).
 *
 * Covers the persistence-layer atomicity properties that only surface
 * against a real Postgres:
 *
 *   - `allocateSlot` issues an atomic `nextIndex: { increment: 1 }` UPDATE.
 *     Concurrent allocations receive distinct indexes (no lost-update gap).
 *   - Once a row is `frozen=true`, further allocations raise
 *     `StatusListFrozenError` (mapped from Prisma P2025).
 *   - `findMaxNumericListKey` returns `MAX(list_key::int)` for digit-only keys.
 *   - Bootstrap → capacity → freeze flow round-trips through `create` /
 *     `allocateSlot` / `findActive` (capacity reached forces rollover).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (StatusListCredential schema)
 *   docs/report/did-vc-internalization.md §5.2.4 (Application service shape)
 *   docs/report/did-vc-internalization.md §7     (Revocation lifecycle)
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import StatusListRepository from "@/application/domain/credential/statusList/data/repository";
import { StatusListFrozenError } from "@/application/domain/credential/statusList/data/errors";
import { IContext } from "@/types/server";

describe("StatusListRepository (integration)", () => {
  jest.setTimeout(30_000);
  let repo: StatusListRepository;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    repo = container.resolve<StatusListRepository>("StatusListRepository");
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  function buildCtx(): IContext {
    return { issuer } as unknown as IContext;
  }

  async function bootstrap(listKey: string, capacity = 4) {
    return repo.create(buildCtx(), {
      listKey,
      capacity,
      encodedList: new Uint8Array(Math.ceil(capacity / 8)),
      vcJwt: `bootstrap-jwt-${listKey}`,
    });
  }

  describe("allocateSlot — atomic increment", () => {
    it("returns sequential indexes for serial allocations", async () => {
      const row = await bootstrap("1", 4);
      const ctx = buildCtx();

      const a = await repo.allocateSlot(ctx, row.id);
      const b = await repo.allocateSlot(ctx, row.id);
      expect(a.allocatedIndex).toBe(0);
      expect(b.allocatedIndex).toBe(1);
      expect(b.row.nextIndex).toBe(2);
    });

    it("returns distinct indexes for concurrent allocations (no lost-update)", async () => {
      const row = await bootstrap("1", 8);
      const ctx = buildCtx();

      const [first, second] = await Promise.all([
        repo.allocateSlot(ctx, row.id),
        repo.allocateSlot(ctx, row.id),
      ]);

      // Postgres serializes the UPDATEs; both allocators must see distinct
      // indexes (0 and 1 in some order).
      expect(new Set([first.allocatedIndex, second.allocatedIndex])).toEqual(
        new Set([0, 1]),
      );
    });

    it("freezes the row on the final allocation (allocatedIndex == capacity-1)", async () => {
      const row = await bootstrap("1", 2);
      const ctx = buildCtx();

      const a = await repo.allocateSlot(ctx, row.id);
      const b = await repo.allocateSlot(ctx, row.id);
      expect(a.allocatedIndex).toBe(0);
      expect(b.allocatedIndex).toBe(1);
      expect(b.row.frozen).toBe(true);
    });

    it("raises StatusListFrozenError after the row is frozen", async () => {
      const row = await bootstrap("1", 1);
      const ctx = buildCtx();

      // First (and only) allocation freezes the row.
      const a = await repo.allocateSlot(ctx, row.id);
      expect(a.row.frozen).toBe(true);

      await expect(repo.allocateSlot(ctx, row.id)).rejects.toBeInstanceOf(
        StatusListFrozenError,
      );
    });
  });

  describe("findMaxNumericListKey", () => {
    it("returns null for an empty table", async () => {
      const max = await repo.findMaxNumericListKey(buildCtx());
      expect(max).toBeNull();
    });

    it("returns MAX(list_key::int) over digit-only listKeys", async () => {
      await bootstrap("1");
      await bootstrap("2");
      await bootstrap("10");
      const max = await repo.findMaxNumericListKey(buildCtx());
      expect(max).toBe(10);
    });
  });

  describe("findActive", () => {
    it("returns the latest non-frozen row by createdAt DESC", async () => {
      const ctx = buildCtx();
      const first = await bootstrap("1");
      // Sleep so the second row's createdAt is strictly greater.
      await new Promise((r) => setTimeout(r, 10));
      const second = await bootstrap("2");

      const active = await repo.findActive(ctx);
      expect(active!.id).toBe(second.id);
      expect(active!.id).not.toBe(first.id);
    });

    it("skips frozen rows (the frozen-list rotation case)", async () => {
      const ctx = buildCtx();
      const oldList = await bootstrap("1", 1);
      // Drain the only slot so the row is frozen.
      await repo.allocateSlot(ctx, oldList.id);

      // Bootstrap the next list — `findActive` must surface this one,
      // not the frozen "1".
      await new Promise((r) => setTimeout(r, 10));
      const newList = await bootstrap("2");

      const active = await repo.findActive(ctx);
      expect(active!.id).toBe(newList.id);

      // Sanity check: the frozen row is still queryable directly.
      const frozenRow = await prismaClient.statusListCredential.findUnique({
        where: { id: oldList.id },
      });
      expect(frozenRow!.frozen).toBe(true);
    });
  });

  describe("bootstrap → capacity → rollover flow", () => {
    it("rolls over to a new list once capacity is reached", async () => {
      const ctx = buildCtx();
      const first = await bootstrap("1", 1);
      const slot = await repo.allocateSlot(ctx, first.id);
      expect(slot.allocatedIndex).toBe(0);
      expect(slot.row.frozen).toBe(true);

      // Find current MAX for next sequential bootstrap (mirrors the
      // service-layer rollover path).
      const maxBefore = await repo.findMaxNumericListKey(ctx);
      expect(maxBefore).toBe(1);

      const next = await bootstrap(String(maxBefore! + 1), 1);
      const nextSlot = await repo.allocateSlot(ctx, next.id);
      expect(nextSlot.allocatedIndex).toBe(0);
      expect(nextSlot.row.listKey).toBe("2");
    });
  });
});
