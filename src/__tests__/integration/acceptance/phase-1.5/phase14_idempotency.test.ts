/**
 * §14.2 受け入れ: idempotency (Phase 1.5).
 *
 * 設計書 §14.2 (line 2117-2125) のうち:
 *
 *   [x] idempotency: バッチ submit 中の crash 後、再起動時に同じ batchId で
 *       復旧して二重 anchor が起きない、PENDING リセット禁止
 *
 * 構造:
 *   1. PENDING な VcAnchor を seed → 1 回目の runWeeklyBatch を実行
 *      → SUBMITTED → CONFIRMED まで進み、Blockfrost.submitTx は 1 回呼ばれる
 *   2. 同じ batchId で 2 回目を実行 → §5.3.1 idempotency early return
 *      submit が再度走らないことを確認
 *   3. CAS 経路: getBatchTerminalStatus が PENDING を返した状態でも、
 *      claimPendingAnchors が 0 件しか claim できなかった場合は submit が
 *      走らずに PENDING で early return することを確認 (CAS 競合)
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { AnchorStatus, ChainNetwork } from "@prisma/client";
import { prismaClient, PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { AnchorBatchService } from "@/application/domain/anchor/anchorBatch/service";
import {
  buildCtx,
  createMockBlockfrostClient,
  createMockSlotProvider,
  cslKeygenMockFactory,
  cslTxBuilderMockFactory,
  fakeVcJwt,
  registerBlockfrostMocks,
  restoreEnv,
  seedPendingVcAnchor,
  seedUserParticipationEvaluation,
  seedVcRequest,
  setupAcceptanceTest,
  teardownAcceptanceTest,
  wireCardanoTestEnv,
} from "@/__tests__/integration/acceptance/phase-1.5/__helpers__/setup";

// Mock CSL-heavy modules (same approach as the unit-test suite).
// jest.mock is hoisted, so the call sites must stay in this file — but the
// factory bodies live in the shared helper.
jest.mock(
  "@/infrastructure/libs/cardano/txBuilder",
  cslTxBuilderMockFactory({ txHashHex: "12".repeat(32) }),
);
jest.mock("@/infrastructure/libs/cardano/keygen", cslKeygenMockFactory());

describe("[§14.2] AnchorBatch idempotency — re-running the same batchId is a no-op", () => {
  jest.setTimeout(30_000);
  let issuer: PrismaClientIssuer;

  const mockBlockfrost = createMockBlockfrostClient({
    submittedTxHash: "12".repeat(32),
    blockHeight: 7_777_777,
    utxoTxHash: "ee".repeat(32),
  });
  const mockSlotProvider = createMockSlotProvider();

  beforeEach(async () => {
    ({ issuer } = await setupAcceptanceTest());

    wireCardanoTestEnv();
    registerBlockfrostMocks(mockBlockfrost, mockSlotProvider);

    mockBlockfrost.submitTx.mockClear();
    mockBlockfrost.awaitConfirmation.mockClear();
  });

  afterEach(() => {
    restoreEnv();
  });

  afterAll(async () => {
    await teardownAcceptanceTest();
  });

  async function seedPendingVcAnchorForUser(): Promise<{ vcAnchorId: string }> {
    const { userId, evaluationId } = await seedUserParticipationEvaluation({
      name: "Idempotency Acceptance User",
      slugPrefix: "idem",
    });
    const vcRequest = await seedVcRequest({
      userId,
      evaluationId,
      vcJwt: fakeVcJwt({ issuer: "did:web:api.civicship.app" }, "idem"),
    });
    const vcAnchor = await seedPendingVcAnchor({ vcRequestIds: [vcRequest.id] });
    return { vcAnchorId: vcAnchor.id };
  }

  it("re-running the same weeklyKey after success is a no-op (no second submitTx)", async () => {
    const { vcAnchorId } = await seedPendingVcAnchorForUser();
    const ctx = buildCtx(issuer);
    const service = container.resolve(AnchorBatchService);

    const first = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });
    expect(first.submitted).toBe(true);
    expect(first.status).toBe(AnchorStatus.CONFIRMED);
    expect(mockBlockfrost.submitTx).toHaveBeenCalledTimes(1);
    const txHashFirst = first.txHash;

    // Second run: §5.3.1 idempotent early return.
    const second = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });
    expect(second.submitted).toBe(true);
    // status mirrors the existing terminal status (CONFIRMED).
    expect(second.status).toBe(AnchorStatus.CONFIRMED);
    expect(second.txHash).toBe(txHashFirst);
    // Critical invariant: submitTx was NOT called a second time.
    expect(mockBlockfrost.submitTx).toHaveBeenCalledTimes(1);

    // VcAnchor row stays at CONFIRMED + carries the original chainTxHash;
    // batchId / status are NOT reset back to PENDING.
    const vcAnchorAfter = await prismaClient.vcAnchor.findUnique({
      where: { id: vcAnchorId },
    });
    expect(vcAnchorAfter).toMatchObject({
      status: AnchorStatus.CONFIRMED,
      batchId: "2026-W19",
      chainTxHash: txHashFirst,
    });
  });

  it("re-running the same weeklyKey after a SUBMITTED-but-not-CONFIRMED state does not re-submit", async () => {
    // Simulate a crashed batch: rows are SUBMITTED with batchId set but no
    // CONFIRMED yet. Recovery must NOT reset PENDING / re-submit.
    const { vcAnchorId } = await seedPendingVcAnchorForUser();
    const submittedAt = new Date();
    const tx = await prismaClient.transactionAnchor.create({
      data: {
        periodStart: new Date(),
        periodEnd: new Date(),
        rootHash: "0".repeat(64),
        leafIds: ["pre-existing-leaf"],
        leafCount: 1,
        network: ChainNetwork.CARDANO_PREPROD,
        status: AnchorStatus.SUBMITTED,
        chainTxHash: "99".repeat(32),
        submittedAt,
        batchId: "2026-W19",
      },
    });
    await prismaClient.vcAnchor.update({
      where: { id: vcAnchorId },
      data: {
        status: AnchorStatus.SUBMITTED,
        chainTxHash: "99".repeat(32),
        submittedAt,
        batchId: "2026-W19",
      },
    });

    const ctx = buildCtx(issuer);
    const service = container.resolve(AnchorBatchService);
    const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

    expect(result.submitted).toBe(true);
    expect(result.status).toBe(AnchorStatus.SUBMITTED);
    expect(result.txHash).toBe("99".repeat(32));
    expect(mockBlockfrost.submitTx).not.toHaveBeenCalled();

    // Rows are NOT reset to PENDING.
    const vcRow = await prismaClient.vcAnchor.findUnique({ where: { id: vcAnchorId } });
    expect(vcRow).toMatchObject({
      status: AnchorStatus.SUBMITTED,
      batchId: "2026-W19",
    });
    const txRow = await prismaClient.transactionAnchor.findUnique({ where: { id: tx.id } });
    expect(txRow).toMatchObject({
      status: AnchorStatus.SUBMITTED,
      batchId: "2026-W19",
    });
  });

  it("CAS race: when another batch claimed the rows first, runWeeklyBatch returns PENDING without submitting", async () => {
    // Simulate a parallel batch that already claimed the row but did not
    // mark it SUBMITTED yet (rows: PENDING but `batchId != null`). The
    // current run's `findPendingAnchors` filter (`batchId IS NULL`) will
    // skip the row, so we expect early "no PENDING" return.
    const { vcAnchorId } = await seedPendingVcAnchorForUser();
    await prismaClient.vcAnchor.update({
      where: { id: vcAnchorId },
      data: { batchId: "concurrent-other-batch" },
    });

    const ctx = buildCtx(issuer);
    const service = container.resolve(AnchorBatchService);
    const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

    expect(result.submitted).toBe(false);
    expect(result.status).toBe(AnchorStatus.PENDING);
    expect(mockBlockfrost.submitTx).not.toHaveBeenCalled();

    // Row still belongs to the other batchId — current run did NOT steal it.
    const vcRow = await prismaClient.vcAnchor.findUnique({ where: { id: vcAnchorId } });
    expect(vcRow).toMatchObject({
      batchId: "concurrent-other-batch",
      status: AnchorStatus.PENDING,
    });
  });
});
