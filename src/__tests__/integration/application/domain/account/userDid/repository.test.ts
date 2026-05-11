/**
 * Integration tests for `UserDidAnchorRepository` (Phase 1.5).
 *
 * Background: the Phase 1 step 7 PR replaced the in-memory stub with a
 * Prisma-backed repository. The unit tests cover the call shape via
 * `useValue` mocks but do NOT exercise the actual SQL round-trip — that
 * coverage only comes from a real Postgres. This file exercises the
 * full `UserDidAnchor` round-trip against the test database.
 *
 * Coverage:
 *   1. `findLatestByUserId` returns the most recent row by `createdAt DESC`.
 *   2. `createCreate` / `createUpdate` / `createDeactivate` persist the
 *      operation marker and the documentCbor / documentHash fields.
 *   3. DEACTIVATE rows persist `documentCbor = null` (§E).
 *   4. `network` is honoured per-row (CARDANO_PREPROD vs CARDANO_MAINNET).
 *   5. The schema-level `previousAnchorId` column defaults to `null` for
 *      every row created by the current repository surface (chain wiring
 *      lands in a follow-up phase, this test pins the current contract).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.1
 *   CLAUDE.md "Testing Guidelines" — integration tests with real database
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { ChainNetwork, CurrentPrefecture, DidOperation } from "@prisma/client";
import { registerProductionDependencies } from "@/application/provider";
import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import UserDidAnchorRepository from "@/application/domain/account/userDid/data/repository";
import { IContext } from "@/types/server";

describe("UserDidAnchorRepository (integration)", () => {
  jest.setTimeout(30_000);
  let repo: UserDidAnchorRepository;
  let issuer: PrismaClientIssuer;
  let userId: string;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    repo = container.resolve<UserDidAnchorRepository>("UserDidAnchorRepository");

    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: `user-${Date.now()}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    userId = user.id;
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  function buildCtx(): IContext {
    return { issuer } as unknown as IContext;
  }

  describe("findLatestByUserId", () => {
    it("returns null when no anchor exists", async () => {
      const result = await repo.findLatestByUserId(userId);
      expect(result).toBeNull();
    });

    it("returns the most recent row ordered by createdAt DESC", async () => {
      const ctx = buildCtx();
      const cbor = new Uint8Array([1, 2, 3, 4]);

      const first = await repo.createCreate(ctx, {
        userId,
        did: `did:web:api.civicship.app:users:${userId}`,
        documentHash: "a".repeat(64),
        documentCbor: cbor,
        network: "CARDANO_PREPROD",
      });

      // Sleep a sliver so `createdAt` differs (Postgres timestamp resolution
      // is microseconds, but separate `INSERT` statements can still land
      // within the same micro-second on very fast machines).
      await new Promise((r) => setTimeout(r, 10));

      const second = await repo.createUpdate(ctx, {
        userId,
        did: `did:web:api.civicship.app:users:${userId}`,
        documentHash: "b".repeat(64),
        documentCbor: cbor,
        network: "CARDANO_PREPROD",
      });

      const latest = await repo.findLatestByUserId(userId);
      expect(latest).not.toBeNull();
      expect(latest!.id).toBe(second.id);
      expect(latest!.id).not.toBe(first.id);
      expect(latest!.operation).toBe(DidOperation.UPDATE);
    });
  });

  describe("createCreate / createUpdate / createDeactivate", () => {
    it("persists CREATE with documentCbor + Blake2b hash + network", async () => {
      const ctx = buildCtx();
      const cbor = new Uint8Array([0xa1, 0x62, 0x69, 0x64, 0x60]);
      const documentHash = "c".repeat(64);

      const persisted = await repo.createCreate(ctx, {
        userId,
        did: `did:web:api.civicship.app:users:${userId}`,
        documentHash,
        documentCbor: cbor,
        network: "CARDANO_PREPROD",
      });

      expect(persisted.id).toBeTruthy();
      expect(persisted.operation).toBe(DidOperation.CREATE);
      expect(persisted.documentHash).toBe(documentHash);
      expect(persisted.network).toBe(ChainNetwork.CARDANO_PREPROD);

      const row = await prismaClient.userDidAnchor.findUnique({
        where: { id: persisted.id },
      });
      expect(row).not.toBeNull();
      expect(row!.documentCbor).not.toBeNull();
      expect(Array.from(row!.documentCbor!)).toEqual(Array.from(cbor));
      expect(row!.previousAnchorId).toBeNull();
    });

    it("persists UPDATE with operation=UPDATE", async () => {
      const ctx = buildCtx();
      const cbor = new Uint8Array([1, 2, 3]);
      const persisted = await repo.createUpdate(ctx, {
        userId,
        did: `did:web:api.civicship.app:users:${userId}`,
        documentHash: "d".repeat(64),
        documentCbor: cbor,
      });

      expect(persisted.operation).toBe(DidOperation.UPDATE);
      // Default network falls back to mainnet.
      expect(persisted.network).toBe(ChainNetwork.CARDANO_MAINNET);
    });

    it("persists DEACTIVATE with documentCbor = null (§E tombstone)", async () => {
      const ctx = buildCtx();
      const persisted = await repo.createDeactivate(ctx, {
        userId,
        did: `did:web:api.civicship.app:users:${userId}`,
        documentHash: "e".repeat(64),
        network: "CARDANO_PREPROD",
      });

      expect(persisted.operation).toBe(DidOperation.DEACTIVATE);

      const row = await prismaClient.userDidAnchor.findUnique({
        where: { id: persisted.id },
      });
      expect(row).not.toBeNull();
      // §E: tombstones do not persist CBOR; the resolver reconstructs.
      expect(row!.documentCbor).toBeNull();
    });
  });

  describe("network selection", () => {
    it("persists separate rows under CARDANO_PREPROD vs CARDANO_MAINNET", async () => {
      const ctx = buildCtx();
      const cbor = new Uint8Array([9, 9, 9]);

      const preprod = await repo.createCreate(ctx, {
        userId,
        did: `did:web:api.civicship.app:users:${userId}`,
        documentHash: "1".repeat(64),
        documentCbor: cbor,
        network: "CARDANO_PREPROD",
      });

      const mainnet = await repo.createUpdate(ctx, {
        userId,
        did: `did:web:api.civicship.app:users:${userId}`,
        documentHash: "2".repeat(64),
        documentCbor: cbor,
        network: "CARDANO_MAINNET",
      });

      // Both are queryable; `findLatestByUserId` is network-agnostic, so we
      // assert the schema-level partitioning by reading via Prisma directly.
      const allForUser = await prismaClient.userDidAnchor.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      expect(allForUser).toHaveLength(2);
      const networks = allForUser.map((r) => r.network);
      expect(networks).toContain(ChainNetwork.CARDANO_PREPROD);
      expect(networks).toContain(ChainNetwork.CARDANO_MAINNET);

      const preprodRow = allForUser.find((r) => r.id === preprod.id);
      const mainnetRow = allForUser.find((r) => r.id === mainnet.id);
      expect(preprodRow!.network).toBe(ChainNetwork.CARDANO_PREPROD);
      expect(mainnetRow!.network).toBe(ChainNetwork.CARDANO_MAINNET);
    });
  });
});
