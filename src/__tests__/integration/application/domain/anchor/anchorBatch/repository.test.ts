/**
 * Integration tests for `AnchorBatchRepository` (Phase 1.5).
 *
 * Verifies the SQL round-trip for the weekly anchor batch surface:
 *
 *   - `findPendingAnchors` collates `transactionAnchor` / `vcAnchor` /
 *     `userDidAnchor` rows in PENDING + batchId IS NULL.
 *   - `claimPendingAnchors` performs a CAS update (PENDING + batchId IS NULL
 *     → batchId = X). A second concurrent claim observes 0 rows.
 *   - `markSubmitted` / `markConfirmed` / `markFailed` advance the state
 *     machine and stamp side-channel columns (`chainTxHash`, `submittedAt`,
 *     `confirmedAt`, `lastError`).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.3 (anchor.repository.ts)
 *   docs/report/did-vc-internalization.md §5.3.1 (idempotency / CAS)
 */

import "reflect-metadata";
import { container } from "tsyringe";
import {
  AnchorStatus,
  ChainNetwork,
  CurrentPrefecture,
  DidOperation,
} from "@prisma/client";
import { registerProductionDependencies } from "@/application/provider";
import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import AnchorBatchRepository from "@/application/domain/anchor/anchorBatch/data/repository";
import { IContext } from "@/types/server";

describe("AnchorBatchRepository (integration)", () => {
  jest.setTimeout(30_000);
  let repo: AnchorBatchRepository;
  let issuer: PrismaClientIssuer;
  let userId: string;

  async function seedTransactionAnchor(): Promise<string> {
    const row = await prismaClient.transactionAnchor.create({
      data: {
        periodStart: new Date("2026-05-01T00:00:00Z"),
        periodEnd: new Date("2026-05-08T00:00:00Z"),
        rootHash: "0".repeat(64),
        leafIds: ["tx-leaf-1"],
        leafCount: 1,
        network: ChainNetwork.CARDANO_PREPROD,
      },
    });
    return row.id;
  }

  async function seedVcAnchor(): Promise<string> {
    const row = await prismaClient.vcAnchor.create({
      data: {
        periodStart: new Date("2026-05-01T00:00:00Z"),
        periodEnd: new Date("2026-05-08T00:00:00Z"),
        rootHash: "0".repeat(64),
        leafIds: ["vc-leaf-1"],
        leafCount: 1,
        network: ChainNetwork.CARDANO_PREPROD,
      },
    });
    return row.id;
  }

  async function seedUserDidAnchor(theUserId: string): Promise<string> {
    const row = await prismaClient.userDidAnchor.create({
      data: {
        did: `did:web:api.civicship.app:users:${theUserId}`,
        operation: DidOperation.CREATE,
        documentHash: "f".repeat(64),
        network: ChainNetwork.CARDANO_PREPROD,
        user: { connect: { id: theUserId } },
      },
    });
    return row.id;
  }

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    repo = container.resolve<AnchorBatchRepository>("AnchorBatchRepository");

    const user = await TestDataSourceHelper.createUser({
      name: "Anchor Test User",
      slug: `anchor-${Date.now()}`,
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

  describe("findPendingAnchors", () => {
    it("collates pending tx / vc / did anchors in a single call", async () => {
      const txId = await seedTransactionAnchor();
      const vcId = await seedVcAnchor();
      const didId = await seedUserDidAnchor(userId);

      const result = await repo.findPendingAnchors(buildCtx());
      expect(result.transactionAnchors.map((a) => a.id)).toContain(txId);
      expect(result.vcAnchors.map((a) => a.id)).toContain(vcId);
      expect(result.userDidAnchors.map((a) => a.id)).toContain(didId);
    });

    it("ignores rows already claimed (batchId IS NOT NULL)", async () => {
      const txId = await seedTransactionAnchor();
      await prismaClient.transactionAnchor.update({
        where: { id: txId },
        data: { batchId: "claimed-batch" },
      });

      const result = await repo.findPendingAnchors(buildCtx());
      expect(result.transactionAnchors.map((a) => a.id)).not.toContain(txId);
    });
  });

  describe("claimPendingAnchors (CAS)", () => {
    it("claims PENDING + batchId IS NULL rows by stamping batchId", async () => {
      const txId = await seedTransactionAnchor();
      const vcId = await seedVcAnchor();
      const didId = await seedUserDidAnchor(userId);

      const result = await repo.claimPendingAnchors(buildCtx(), {
        batchId: "weekly-2026-05-01",
        transactionAnchorIds: [txId],
        vcAnchorIds: [vcId],
        userDidAnchorIds: [didId],
      });

      expect(result.transactionAnchors).toBe(1);
      expect(result.vcAnchors).toBe(1);
      expect(result.userDidAnchors).toBe(1);

      const tx = await prismaClient.transactionAnchor.findUnique({ where: { id: txId } });
      const vc = await prismaClient.vcAnchor.findUnique({ where: { id: vcId } });
      const did = await prismaClient.userDidAnchor.findUnique({ where: { id: didId } });
      expect(tx!.batchId).toBe("weekly-2026-05-01");
      expect(vc!.batchId).toBe("weekly-2026-05-01");
      expect(did!.batchId).toBe("weekly-2026-05-01");
    });

    it("returns count=0 when a parallel claim already stamped the rows", async () => {
      const txId = await seedTransactionAnchor();
      const ctx = buildCtx();

      // First claimer wins.
      const winner = await repo.claimPendingAnchors(ctx, {
        batchId: "winning-batch",
        transactionAnchorIds: [txId],
        vcAnchorIds: [],
        userDidAnchorIds: [],
      });
      expect(winner.transactionAnchors).toBe(1);

      // Second claimer (concurrent batch) sees the row already taken — the
      // CAS guard `status: PENDING, batchId: null` no longer matches.
      const loser = await repo.claimPendingAnchors(ctx, {
        batchId: "losing-batch",
        transactionAnchorIds: [txId],
        vcAnchorIds: [],
        userDidAnchorIds: [],
      });
      expect(loser.transactionAnchors).toBe(0);

      const finalRow = await prismaClient.transactionAnchor.findUnique({
        where: { id: txId },
      });
      expect(finalRow!.batchId).toBe("winning-batch");
    });
  });

  describe("markSubmitted / markConfirmed / markFailed", () => {
    it("markSubmitted advances all three anchor types to SUBMITTED with chainTxHash", async () => {
      const ctx = buildCtx();
      const txId = await seedTransactionAnchor();
      const vcId = await seedVcAnchor();
      const didId = await seedUserDidAnchor(userId);
      await repo.claimPendingAnchors(ctx, {
        batchId: "b1",
        transactionAnchorIds: [txId],
        vcAnchorIds: [vcId],
        userDidAnchorIds: [didId],
      });

      await repo.markSubmitted(ctx, {
        batchId: "b1",
        chainTxHash: "deadbeef".repeat(8),
        transactionAnchorIds: [txId],
        vcAnchorIds: [vcId],
        userDidAnchorIds: [didId],
      });

      const tx = await prismaClient.transactionAnchor.findUnique({ where: { id: txId } });
      const vc = await prismaClient.vcAnchor.findUnique({ where: { id: vcId } });
      const did = await prismaClient.userDidAnchor.findUnique({ where: { id: didId } });
      expect(tx!.status).toBe(AnchorStatus.SUBMITTED);
      expect(vc!.status).toBe(AnchorStatus.SUBMITTED);
      expect(did!.status).toBe(AnchorStatus.SUBMITTED);
      expect(tx!.chainTxHash).toBe("deadbeef".repeat(8));
      expect(tx!.submittedAt).not.toBeNull();
    });

    it("markConfirmed advances to CONFIRMED with confirmedAt + blockHeight", async () => {
      const ctx = buildCtx();
      const txId = await seedTransactionAnchor();
      const vcId = await seedVcAnchor();
      const didId = await seedUserDidAnchor(userId);
      await repo.claimPendingAnchors(ctx, {
        batchId: "b2",
        transactionAnchorIds: [txId],
        vcAnchorIds: [vcId],
        userDidAnchorIds: [didId],
      });

      await repo.markConfirmed(ctx, {
        batchId: "b2",
        blockHeight: 12345678,
        transactionAnchorIds: [txId],
        vcAnchorIds: [vcId],
        userDidAnchorIds: [didId],
      });

      const tx = await prismaClient.transactionAnchor.findUnique({ where: { id: txId } });
      const vc = await prismaClient.vcAnchor.findUnique({ where: { id: vcId } });
      const did = await prismaClient.userDidAnchor.findUnique({ where: { id: didId } });
      expect(tx!.status).toBe(AnchorStatus.CONFIRMED);
      expect(vc!.status).toBe(AnchorStatus.CONFIRMED);
      expect(did!.status).toBe(AnchorStatus.CONFIRMED);
      expect(tx!.blockHeight).toBe(12345678);
      expect(vc!.blockHeight).toBe(12345678);
      // userDidAnchor schema has no blockHeight column — confirmedAt is the
      // only confirmation marker.
      expect(did!.confirmedAt).not.toBeNull();
    });

    it("markFailed advances to FAILED with lastError on tx / vc anchors", async () => {
      const ctx = buildCtx();
      const txId = await seedTransactionAnchor();
      const vcId = await seedVcAnchor();
      const didId = await seedUserDidAnchor(userId);
      await repo.claimPendingAnchors(ctx, {
        batchId: "b3",
        transactionAnchorIds: [txId],
        vcAnchorIds: [vcId],
        userDidAnchorIds: [didId],
      });

      await repo.markFailed(ctx, {
        batchId: "b3",
        failureReason: "Cardano node unavailable",
        transactionAnchorIds: [txId],
        vcAnchorIds: [vcId],
        userDidAnchorIds: [didId],
      });

      const tx = await prismaClient.transactionAnchor.findUnique({ where: { id: txId } });
      const vc = await prismaClient.vcAnchor.findUnique({ where: { id: vcId } });
      const did = await prismaClient.userDidAnchor.findUnique({ where: { id: didId } });
      expect(tx!.status).toBe(AnchorStatus.FAILED);
      expect(vc!.status).toBe(AnchorStatus.FAILED);
      expect(did!.status).toBe(AnchorStatus.FAILED);
      expect(tx!.lastError).toBe("Cardano node unavailable");
      expect(vc!.lastError).toBe("Cardano node unavailable");
    });
  });

  describe("getBatchTerminalStatus", () => {
    it("returns null when no rows exist for batchId", async () => {
      const status = await repo.getBatchTerminalStatus(buildCtx(), "missing-batch");
      expect(status).toBeNull();
    });

    it("returns CONFIRMED when at least one tx-anchor in the batch is CONFIRMED", async () => {
      const ctx = buildCtx();
      const txId = await seedTransactionAnchor();
      await repo.claimPendingAnchors(ctx, {
        batchId: "terminal-batch",
        transactionAnchorIds: [txId],
        vcAnchorIds: [],
        userDidAnchorIds: [],
      });
      await repo.markConfirmed(ctx, {
        batchId: "terminal-batch",
        blockHeight: 1,
        transactionAnchorIds: [txId],
        vcAnchorIds: [],
        userDidAnchorIds: [],
      });

      const status = await repo.getBatchTerminalStatus(ctx, "terminal-batch");
      expect(status).toBe(AnchorStatus.CONFIRMED);
    });
  });
});
