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
import {
  AnchorStatus,
  ChainNetwork,
  CurrentPrefecture,
  EvaluationStatus,
  ParticipationStatus,
  ParticipationStatusReason,
  Source,
  VcFormat,
  VcIssuanceStatus,
} from "@prisma/client";
import { registerProductionDependencies } from "@/application/provider";
import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { AnchorBatchService } from "@/application/domain/anchor/anchorBatch/service";
import { IContext } from "@/types/server";

// Mock CSL-heavy modules (same approach as the unit-test suite).
jest.mock("@/infrastructure/libs/cardano/txBuilder", () => {
  const actual = jest.requireActual("@/infrastructure/libs/cardano/txBuilder");
  return {
    ...actual,
    buildAnchorTx: jest.fn(() => ({
      tx: { __mock: "Transaction" },
      txHashHex: "12".repeat(32),
      txCborBytes: new Uint8Array([0x01, 0x02]),
    })),
    buildAuxiliaryData: jest.fn(() => ({ __mock: "AuxiliaryData" })),
  };
});

jest.mock("@/infrastructure/libs/cardano/keygen", () => {
  const actual = jest.requireActual("@/infrastructure/libs/cardano/keygen");
  return {
    ...actual,
    deriveCardanoKeypair: jest.fn(() => ({
      cslPrivateKey: { __mock: "PrivateKey" },
      cslPublicKey: { __mock: "PublicKey" },
      addressBech32: "addr_test1mock",
      paymentKeyHashHex: "00".repeat(28),
      privateKeySeed: new Uint8Array(32),
      publicKey: new Uint8Array(32),
      network: "preprod" as const,
    })),
  };
});

const TEST_SEED_HEX = "11".repeat(32);
const TEST_BECH32 = "addr_test1mock";
const ENV_BACKUP: Record<string, string | undefined> = {};

function setEnv(key: string, value: string | undefined): void {
  if (!(key in ENV_BACKUP)) ENV_BACKUP[key] = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function restoreEnv(): void {
  for (const k of Object.keys(ENV_BACKUP)) {
    const v = ENV_BACKUP[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

function fakeVcJwt(salt: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "ES256K", typ: "JWT", salt })).toString(
    "base64url",
  );
  const body = Buffer.from(JSON.stringify({ issuer: "did:web:api.civicship.app" })).toString(
    "base64url",
  );
  return `${header}.${body}.sig-${salt}`;
}

describe("[§14.2] AnchorBatch idempotency — re-running the same batchId is a no-op", () => {
  jest.setTimeout(30_000);
  let issuer: PrismaClientIssuer;

  const submitTx = jest.fn().mockResolvedValue("12".repeat(32));
  const awaitConfirmation = jest.fn().mockResolvedValue({
    hash: "12".repeat(32),
    block_height: 7_777_777,
    block_time: 1_700_000_000,
  });

  const mockBlockfrost = {
    getProtocolParams: jest.fn().mockResolvedValue({
      min_fee_a: 44,
      min_fee_b: 155381,
      pool_deposit: "500000000",
      key_deposit: "2000000",
      max_val_size: "5000",
      max_tx_size: 16384,
      coins_per_utxo_size: "4310",
    }),
    getUtxos: jest.fn().mockResolvedValue([
      {
        tx_hash: "ee".repeat(32),
        output_index: 0,
        amount: [{ unit: "lovelace", quantity: "10000000" }],
      },
    ]),
    submitTx,
    awaitConfirmation,
    getNetwork: jest.fn().mockReturnValue("CARDANO_PREPROD"),
  };
  const mockSlotProvider = { getCurrentSlot: jest.fn().mockResolvedValue(1_000_000) };

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    container.reset();
    registerProductionDependencies();

    setEnv("CARDANO_PLATFORM_PRIVATE_KEY_HEX", TEST_SEED_HEX);
    setEnv("CARDANO_PLATFORM_ADDRESS", TEST_BECH32);
    setEnv("CARDANO_NETWORK", "preprod");

    container.register("BlockfrostClient", { useValue: mockBlockfrost });
    container.register("BlockfrostLatestSlotProvider", { useValue: mockSlotProvider });

    issuer = container.resolve(PrismaClientIssuer);
    submitTx.mockClear();
    awaitConfirmation.mockClear();
  });

  afterEach(() => {
    restoreEnv();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  function buildCtx(): IContext {
    return { issuer } as unknown as IContext;
  }

  async function seedPendingVcAnchor(): Promise<{ vcAnchorId: string }> {
    const user = await TestDataSourceHelper.createUser({
      name: "Idempotency Acceptance User",
      slug: `idem-${Date.now()}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const participation = await prismaClient.participation.create({
      data: {
        status: ParticipationStatus.PARTICIPATED,
        reason: ParticipationStatusReason.PERSONAL_RECORD,
        source: Source.INTERNAL,
        user: { connect: { id: user.id } },
      },
    });
    const evaluation = await prismaClient.evaluation.create({
      data: {
        status: EvaluationStatus.PASSED,
        participation: { connect: { id: participation.id } },
        evaluator: { connect: { id: user.id } },
      },
    });
    const vcRequest = await prismaClient.vcIssuanceRequest.create({
      data: {
        user: { connect: { id: user.id } },
        evaluation: { connect: { id: evaluation.id } },
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: fakeVcJwt("idem"),
        status: VcIssuanceStatus.COMPLETED,
        completedAt: new Date(),
        claims: {},
      },
    });
    const vcAnchor = await prismaClient.vcAnchor.create({
      data: {
        periodStart: new Date("2026-05-01T00:00:00Z"),
        periodEnd: new Date("2026-05-08T00:00:00Z"),
        rootHash: "0".repeat(64),
        leafIds: [vcRequest.id],
        leafCount: 1,
        network: ChainNetwork.CARDANO_PREPROD,
      },
    });
    return { vcAnchorId: vcAnchor.id };
  }

  it("re-running the same weeklyKey after success is a no-op (no second submitTx)", async () => {
    const { vcAnchorId } = await seedPendingVcAnchor();
    const ctx = buildCtx();
    const service = container.resolve(AnchorBatchService);

    const first = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });
    expect(first.submitted).toBe(true);
    expect(first.status).toBe(AnchorStatus.CONFIRMED);
    expect(submitTx).toHaveBeenCalledTimes(1);
    const txHashFirst = first.txHash;

    // Second run: §5.3.1 idempotent early return.
    const second = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });
    expect(second.submitted).toBe(true);
    // status mirrors the existing terminal status (CONFIRMED).
    expect(second.status).toBe(AnchorStatus.CONFIRMED);
    expect(second.txHash).toBe(txHashFirst);
    // Critical invariant: submitTx was NOT called a second time.
    expect(submitTx).toHaveBeenCalledTimes(1);

    // VcAnchor row stays at CONFIRMED + carries the original chainTxHash;
    // batchId / status are NOT reset back to PENDING.
    const vcAnchorAfter = await prismaClient.vcAnchor.findUnique({
      where: { id: vcAnchorId },
    });
    expect(vcAnchorAfter!.status).toBe(AnchorStatus.CONFIRMED);
    expect(vcAnchorAfter!.batchId).toBe("2026-W19");
    expect(vcAnchorAfter!.chainTxHash).toBe(txHashFirst);
  });

  it("re-running the same weeklyKey after a SUBMITTED-but-not-CONFIRMED state does not re-submit", async () => {
    // Simulate a crashed batch: rows are SUBMITTED with batchId set but no
    // CONFIRMED yet. Recovery must NOT reset PENDING / re-submit.
    const { vcAnchorId } = await seedPendingVcAnchor();
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

    const ctx = buildCtx();
    const service = container.resolve(AnchorBatchService);
    const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

    expect(result.submitted).toBe(true);
    expect(result.status).toBe(AnchorStatus.SUBMITTED);
    expect(result.txHash).toBe("99".repeat(32));
    expect(submitTx).not.toHaveBeenCalled();

    // Rows are NOT reset to PENDING.
    const vcRow = await prismaClient.vcAnchor.findUnique({ where: { id: vcAnchorId } });
    expect(vcRow!.status).toBe(AnchorStatus.SUBMITTED);
    expect(vcRow!.batchId).toBe("2026-W19");
    const txRow = await prismaClient.transactionAnchor.findUnique({ where: { id: tx.id } });
    expect(txRow!.status).toBe(AnchorStatus.SUBMITTED);
    expect(txRow!.batchId).toBe("2026-W19");
  });

  it("CAS race: when another batch claimed the rows first, runWeeklyBatch returns PENDING without submitting", async () => {
    // Simulate a parallel batch that already claimed the row but did not
    // mark it SUBMITTED yet (rows: PENDING but `batchId != null`). The
    // current run's `findPendingAnchors` filter (`batchId IS NULL`) will
    // skip the row, so we expect early "no PENDING" return.
    const { vcAnchorId } = await seedPendingVcAnchor();
    await prismaClient.vcAnchor.update({
      where: { id: vcAnchorId },
      data: { batchId: "concurrent-other-batch" },
    });

    const ctx = buildCtx();
    const service = container.resolve(AnchorBatchService);
    const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

    expect(result.submitted).toBe(false);
    expect(result.status).toBe(AnchorStatus.PENDING);
    expect(submitTx).not.toHaveBeenCalled();

    // Row still belongs to the other batchId — current run did NOT steal it.
    const vcRow = await prismaClient.vcAnchor.findUnique({ where: { id: vcAnchorId } });
    expect(vcRow!.batchId).toBe("concurrent-other-batch");
    expect(vcRow!.status).toBe(AnchorStatus.PENDING);
  });
});
