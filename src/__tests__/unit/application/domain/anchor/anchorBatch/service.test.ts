/**
 * Unit tests for `AnchorBatchService`.
 *
 * カバレッジ:
 *   - PENDING が 0 件 → early return（submit 走らない）
 *   - 同 weeklyKey の SUBMITTED batch → idempotent early return
 *   - claimPendingAnchors が 0 件しか claim できなかった場合（並行 batch 競合）
 *     → submit 走らずに PENDING で early return（§5.3.1 CAS）
 *   - submit 成功 → 全 anchor SUBMITTED
 *   - awaitConfirmation 成功 → CONFIRMED
 *   - awaitConfirmation 失敗 → FAILED + failureReason
 *   - Merkle root が決定論的（同入力 → 同 hex）
 *
 * BlockfrostClient / SlotProvider はモック。
 * Phase 1 では `KmsSigner` を inject しないため、tsyringe へのモック登録も不要。
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { AnchorStatus, DidOperation } from "@prisma/client";
import {
  AnchorBatchService,
  computeIsoWeeklyKey,
  isValidWeeklyKey,
  trimDocCborForSizeBudget,
} from "@/application/domain/anchor/anchorBatch/service";
import { IContext } from "@/types/server";
import { buildRoot } from "@/infrastructure/libs/merkle/merkleTreeBuilder";

// Cardano serialization は重いので、txBuilder を最小限モック
const mockBuildAnchorTx = jest.fn();
const mockBuildAuxiliaryData = jest.fn();
jest.mock("@/infrastructure/libs/cardano/txBuilder", () => {
  const actual = jest.requireActual("@/infrastructure/libs/cardano/txBuilder");
  return {
    ...actual,
    buildAnchorTx: (...args: unknown[]) => mockBuildAnchorTx(...args),
    buildAuxiliaryData: (...args: unknown[]) => mockBuildAuxiliaryData(...args),
  };
});

// resolvePlatformSignKey の中で deriveCardanoKeypair が呼ばれる。
// テスト用に env から hex seed を渡せばよいが、CSL の load コストを避けるため
// service.ts 内の resolvePlatformSignKey もモック対象とする
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

// 32-byte seed (raw hex) — テスト用
const TEST_SEED_HEX = "11".repeat(32);
const TEST_BECH32 = "addr_test1mock";

const ENV_BACKUP: Record<string, string | undefined> = {};

function setEnv(key: string, value: string | undefined): void {
  ENV_BACKUP[key] ??= process.env[key];
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

describe("AnchorBatchService", () => {
  let mockRepository: {
    findExistingBatchTransactionAnchors: jest.Mock;
    findPendingAnchors: jest.Mock;
    findVcJwtsByVcIssuanceRequestIds: jest.Mock;
    findPreviousAnchorChainTxHashes: jest.Mock;
    claimPendingAnchors: jest.Mock;
    markSubmitted: jest.Mock;
    markConfirmed: jest.Mock;
    markFailed: jest.Mock;
    getBatchTerminalStatus: jest.Mock;
  };
  let mockBlockfrost: {
    getProtocolParams: jest.Mock;
    getUtxos: jest.Mock;
    submitTx: jest.Mock;
    awaitConfirmation: jest.Mock;
    getNetwork: jest.Mock;
  };
  let mockSlotProvider: { getCurrentSlot: jest.Mock };

  const ctx = {} as IContext;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    setEnv("CARDANO_PLATFORM_PRIVATE_KEY_HEX", TEST_SEED_HEX);
    setEnv("CARDANO_PLATFORM_ADDRESS", TEST_BECH32);
    setEnv("CARDANO_NETWORK", "preprod");

    mockRepository = {
      findExistingBatchTransactionAnchors: jest.fn().mockResolvedValue([]),
      findPendingAnchors: jest.fn().mockResolvedValue({
        transactionAnchors: [],
        vcAnchors: [],
        userDidAnchors: [],
      }),
      findVcJwtsByVcIssuanceRequestIds: jest.fn().mockResolvedValue([]),
      findPreviousAnchorChainTxHashes: jest.fn().mockResolvedValue([]),
      claimPendingAnchors: jest.fn().mockResolvedValue({
        transactionAnchors: 0,
        vcAnchors: 0,
        userDidAnchors: 0,
      }),
      markSubmitted: jest.fn().mockResolvedValue(undefined),
      markConfirmed: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
      getBatchTerminalStatus: jest.fn().mockResolvedValue(null),
    };

    mockBlockfrost = {
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
          tx_hash: "ab".repeat(32),
          output_index: 0,
          amount: [{ unit: "lovelace", quantity: "10000000" }],
        },
      ]),
      submitTx: jest.fn().mockResolvedValue("dead".repeat(16)),
      awaitConfirmation: jest.fn().mockResolvedValue({
        hash: "dead".repeat(16),
        block_height: 12345,
        block_time: 1700000000,
      }),
      getNetwork: jest.fn().mockReturnValue("CARDANO_PREPROD"),
    };

    mockSlotProvider = { getCurrentSlot: jest.fn().mockResolvedValue(1_000_000) };

    mockBuildAnchorTx.mockReturnValue({
      tx: { __mock: "Transaction" },
      txHashHex: "dead".repeat(16),
      txCborBytes: new Uint8Array([0x01, 0x02, 0x03]),
    });
    mockBuildAuxiliaryData.mockReturnValue({ __mock: "AuxiliaryData" });

    container.register("AnchorBatchRepository", { useValue: mockRepository });
    container.register("BlockfrostClient", { useValue: mockBlockfrost });
    container.register("BlockfrostLatestSlotProvider", { useValue: mockSlotProvider });
    container.register("AnchorBatchService", { useClass: AnchorBatchService });
  });

  afterEach(() => {
    restoreEnv();
  });

  // Fixture builders — keep test bodies focused on the assertion under test.
  // Sonar's duplicate detection (≥ 100 token block) was tripping on the
  // repeated `findPendingAnchors.mockResolvedValue({...})` shape across the
  // success / awaitConfirmation-fail / submit-fail cases.
  const PENDING_TX = {
    id: "tx_anchor_1",
    leafIds: ["t_aaa"],
    leafCount: 1,
    rootHash: "00".repeat(32),
    network: "CARDANO_PREPROD",
    status: AnchorStatus.PENDING,
    batchId: null,
    periodStart: new Date(),
    periodEnd: new Date(),
  };

  const PENDING_VC = {
    id: "vc_anchor_1",
    leafIds: ["vc_req_1"],
    leafCount: 1,
    rootHash: "00".repeat(32),
    network: "CARDANO_PREPROD",
    status: AnchorStatus.PENDING,
    batchId: null,
    periodStart: new Date(),
    periodEnd: new Date(),
  };

  const PENDING_DID = {
    id: "did_anchor_1",
    did: "did:web:api.civicship.app:users:u_xyz",
    operation: DidOperation.CREATE,
    documentHash: "ab".repeat(32),
    documentCbor: null,
    previousAnchorId: null,
    network: "CARDANO_PREPROD",
    status: AnchorStatus.PENDING,
    batchId: null,
    userId: "u_xyz",
  };

  function setupPending(opts: {
    transactionAnchors?: (typeof PENDING_TX)[];
    vcAnchors?: (typeof PENDING_VC)[];
    userDidAnchors?: (typeof PENDING_DID)[];
  }) {
    const tx = opts.transactionAnchors ?? [];
    const vc = opts.vcAnchors ?? [];
    const did = opts.userDidAnchors ?? [];
    mockRepository.findPendingAnchors.mockResolvedValue({
      transactionAnchors: tx,
      vcAnchors: vc,
      userDidAnchors: did,
    });
    mockRepository.claimPendingAnchors.mockResolvedValue({
      transactionAnchors: tx.length,
      vcAnchors: vc.length,
      userDidAnchors: did.length,
    });
  }

  describe("isValidWeeklyKey / computeIsoWeeklyKey", () => {
    it("accepts ISO 8601 week format", () => {
      expect(isValidWeeklyKey("2026-W19")).toBe(true);
      expect(isValidWeeklyKey("2025-W01")).toBe(true);
      expect(isValidWeeklyKey("2024-W53")).toBe(true);
    });

    it("rejects malformed keys", () => {
      expect(isValidWeeklyKey("2026-19")).toBe(false);
      expect(isValidWeeklyKey("2026-W")).toBe(false);
      expect(isValidWeeklyKey("2026-W54")).toBe(false);
      expect(isValidWeeklyKey("not-a-key")).toBe(false);
    });

    it("computeIsoWeeklyKey returns YYYY-Www", () => {
      const key = computeIsoWeeklyKey(new Date("2026-05-10T12:00:00Z"));
      expect(key).toMatch(/^\d{4}-W\d{2}$/);
    });
  });

  describe("runWeeklyBatch", () => {
    it("returns early when no PENDING anchors are found", async () => {
      const service = container.resolve(AnchorBatchService);
      const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(result.submitted).toBe(false);
      expect(result.txHash).toBeNull();
      expect(result.anchorCounts).toEqual({ userDid: 0, vc: 0, tx: 0 });
      expect(result.status).toBe(AnchorStatus.PENDING);

      expect(mockRepository.claimPendingAnchors).not.toHaveBeenCalled();
      expect(mockBlockfrost.submitTx).not.toHaveBeenCalled();
    });

    it("returns early when CAS claims 0 rows (concurrent batch race)", async () => {
      // findPendingAnchors では行が見えたが、claimPendingAnchors の CAS で
      // 別 worker に取られて 0 件しか claim できなかったケース。
      // §5.3.1 の CAS 設計通り、submit は走らずに PENDING で early return する。
      setupPending({
        transactionAnchors: [PENDING_TX],
        vcAnchors: [PENDING_VC],
        userDidAnchors: [PENDING_DID],
      });
      // setupPending の後で claim だけ 0 件に上書き
      mockRepository.claimPendingAnchors.mockResolvedValue({
        transactionAnchors: 0,
        vcAnchors: 0,
        userDidAnchors: 0,
      });

      const service = container.resolve(AnchorBatchService);
      const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(result.submitted).toBe(false);
      expect(result.txHash).toBeNull();
      expect(result.anchorCounts).toEqual({ userDid: 0, vc: 0, tx: 0 });
      expect(result.status).toBe(AnchorStatus.PENDING);

      // 並行 batch 競合では submit / markSubmitted / markFailed のいずれも走らない
      expect(mockRepository.claimPendingAnchors).toHaveBeenCalledTimes(1);
      expect(mockBlockfrost.submitTx).not.toHaveBeenCalled();
      expect(mockRepository.markSubmitted).not.toHaveBeenCalled();
      expect(mockRepository.markConfirmed).not.toHaveBeenCalled();
      expect(mockRepository.markFailed).not.toHaveBeenCalled();
    });

    it("returns early (idempotent) when the same weeklyKey is already SUBMITTED", async () => {
      mockRepository.getBatchTerminalStatus.mockResolvedValue(AnchorStatus.SUBMITTED);
      mockRepository.findExistingBatchTransactionAnchors.mockResolvedValue([
        {
          id: "tx_anchor_1",
          leafIds: ["t_aaa"],
          leafCount: 1,
          rootHash: "00".repeat(32),
          network: "CARDANO_PREPROD",
          status: AnchorStatus.SUBMITTED,
          batchId: "2026-W19",
          chainTxHash: "ff".repeat(32),
          periodStart: new Date(),
          periodEnd: new Date(),
        },
      ]);

      const service = container.resolve(AnchorBatchService);
      const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(result.submitted).toBe(true);
      expect(result.status).toBe(AnchorStatus.SUBMITTED);
      expect(result.txHash).toBe("ff".repeat(32));
      expect(mockRepository.findPendingAnchors).not.toHaveBeenCalled();
      expect(mockBlockfrost.submitTx).not.toHaveBeenCalled();
    });

    it("returns early (idempotent) when the same weeklyKey is already CONFIRMED", async () => {
      mockRepository.getBatchTerminalStatus.mockResolvedValue(AnchorStatus.CONFIRMED);
      mockRepository.findExistingBatchTransactionAnchors.mockResolvedValue([]);

      const service = container.resolve(AnchorBatchService);
      const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(result.status).toBe(AnchorStatus.CONFIRMED);
      expect(mockBlockfrost.submitTx).not.toHaveBeenCalled();
    });

    it("submits and marks all anchors SUBMITTED then CONFIRMED on success", async () => {
      setupPending({
        transactionAnchors: [{ ...PENDING_TX, leafIds: ["t_aaa", "t_bbb"], leafCount: 2 }],
        vcAnchors: [PENDING_VC],
        userDidAnchors: [PENDING_DID],
      });
      mockRepository.findVcJwtsByVcIssuanceRequestIds.mockResolvedValue([
        { vcIssuanceRequestId: "vc_req_1", vcJwt: "header.payload.signature" },
      ]);

      const service = container.resolve(AnchorBatchService);
      const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(result.submitted).toBe(true);
      expect(result.txHash).toBe("dead".repeat(16));
      expect(result.status).toBe(AnchorStatus.CONFIRMED);
      expect(result.anchorCounts).toEqual({ userDid: 1, vc: 1, tx: 1 });

      expect(mockRepository.claimPendingAnchors).toHaveBeenCalledWith(
        ctx,
        expect.objectContaining({
          batchId: "2026-W19",
          transactionAnchorIds: ["tx_anchor_1"],
          vcAnchorIds: ["vc_anchor_1"],
          userDidAnchorIds: ["did_anchor_1"],
        }),
      );
      expect(mockRepository.markSubmitted).toHaveBeenCalledWith(
        ctx,
        expect.objectContaining({
          batchId: "2026-W19",
          chainTxHash: "dead".repeat(16),
        }),
      );
      expect(mockRepository.markConfirmed).toHaveBeenCalledWith(
        ctx,
        expect.objectContaining({
          batchId: "2026-W19",
          blockHeight: 12345,
        }),
      );
      expect(mockRepository.markFailed).not.toHaveBeenCalled();
    });

    it("marks anchors FAILED when awaitConfirmation throws", async () => {
      setupPending({ transactionAnchors: [PENDING_TX] });
      mockBlockfrost.awaitConfirmation.mockRejectedValue(
        new Error("awaitConfirmation timed out after 300000ms"),
      );

      const service = container.resolve(AnchorBatchService);
      const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(result.submitted).toBe(false);
      expect(result.status).toBe(AnchorStatus.FAILED);
      expect(result.failureReason).toMatch(/timed out/);
      expect(mockRepository.markFailed).toHaveBeenCalledWith(
        ctx,
        expect.objectContaining({
          batchId: "2026-W19",
          failureReason: expect.stringContaining("timed out"),
        }),
      );
    });

    it("marks anchors FAILED when submitTx throws", async () => {
      setupPending({ transactionAnchors: [PENDING_TX] });
      mockBlockfrost.submitTx.mockRejectedValue(new Error("submit 5xx"));

      const service = container.resolve(AnchorBatchService);
      const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(result.status).toBe(AnchorStatus.FAILED);
      expect(mockRepository.markFailed).toHaveBeenCalled();
      expect(mockRepository.markConfirmed).not.toHaveBeenCalled();
    });

    it("rejects malformed weeklyKey", async () => {
      const service = container.resolve(AnchorBatchService);
      await expect(service.runWeeklyBatch(ctx, { weeklyKey: "bad-key" })).rejects.toThrow(
        /YYYY-Www/,
      );
    });

    it("uses CARDANO_AWAIT_CONFIRM_TIMEOUT_MS when set to a positive integer", async () => {
      // env override が awaitConfirmation の第 2 引数に渡されることを確認。
      setEnv("CARDANO_AWAIT_CONFIRM_TIMEOUT_MS", "60000");
      setupPending({ transactionAnchors: [PENDING_TX] });

      const service = container.resolve(AnchorBatchService);
      await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(mockBlockfrost.awaitConfirmation).toHaveBeenCalledWith(expect.any(String), 60000);
    });

    it("falls back to the default timeout when CARDANO_AWAIT_CONFIRM_TIMEOUT_MS is invalid", async () => {
      setEnv("CARDANO_AWAIT_CONFIRM_TIMEOUT_MS", "not-a-number");
      setupPending({ transactionAnchors: [PENDING_TX] });

      const service = container.resolve(AnchorBatchService);
      await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      // default は 5 * 60 * 1000 = 300_000ms
      expect(mockBlockfrost.awaitConfirmation).toHaveBeenCalledWith(expect.any(String), 300_000);
    });
  });

  describe("Merkle root determinism", () => {
    it("buildRoot is deterministic for the same sorted JWT inputs", () => {
      const inputs = ["c.payload.sig", "a.payload.sig", "b.payload.sig"].sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0,
      );
      const r1 = buildRoot(inputs);
      const r2 = buildRoot([...inputs]);
      expect(Buffer.from(r1).equals(Buffer.from(r2))).toBe(true);
      expect(r1.length).toBe(32);
    });
  });

  describe("trimDocCborForSizeBudget (§8.4)", () => {
    // These tests bypass the txBuilder mock so they exercise the real
    // metadata size calculation. They live inside the `AnchorBatchService`
    // describe to inherit env restoration, but do NOT depend on the
    // tsyringe container.
    const base = {
      v: 1 as const,
      bid: "2026-W19",
      ts: 1746336034,
    };

    it("returns ops unchanged when metadata is under 16 KB", () => {
      const small = new Uint8Array(100).fill(0xab);
      const ops = [
        {
          k: "c" as const,
          did: "did:web:a:b:c",
          h: "a".repeat(64),
          docCbor: small,
          prev: null,
        },
      ];
      const result = trimDocCborForSizeBudget(base, ops);
      expect(result).toBe(ops);
      expect((result[0] as { docCbor?: Uint8Array }).docCbor).toBe(small);
    });

    it("drops docCbor from the tail op when metadata exceeds 16 KB", () => {
      // Two 9 KB CBOR blobs > 16 KB combined; the second one must lose its
      // docCbor and fall back to the minimal { id } doc.
      const fat = new Uint8Array(9 * 1024).fill(0xcd);
      const ops = [
        {
          k: "c" as const,
          did: "did:web:api.civicship.app:users:u_a",
          h: "a".repeat(64),
          docCbor: fat,
          prev: null,
        },
        {
          k: "c" as const,
          did: "did:web:api.civicship.app:users:u_b",
          h: "b".repeat(64),
          docCbor: fat,
          prev: null,
        },
      ];
      const result = trimDocCborForSizeBudget(base, ops);
      // First op keeps its docCbor; tail op switches to fallback minimal doc.
      expect(result[0].k).toBe("c");
      expect((result[0] as { docCbor?: Uint8Array }).docCbor).toBeDefined();
      expect(result[1].k).toBe("c");
      expect((result[1] as { docCbor?: Uint8Array }).docCbor).toBeUndefined();
      expect((result[1] as { doc?: Record<string, unknown> }).doc).toEqual({
        id: "did:web:api.civicship.app:users:u_b",
      });
    });
  });

  describe("documentCbor chain inclusion (§8.3 / Phase 2)", () => {
    it("forwards documentCbor verbatim as DidOp.docCbor for CREATE/UPDATE", async () => {
      // Pre-encoded DID Document bytes; the service must pass them straight
      // through to txBuilder without re-encoding.
      const cborBytes = new Uint8Array([
        0xa2, 0x62, 0x69, 0x64, 0x70, 0x64, 0x69, 0x64, 0x3a, 0x77, 0x65, 0x62, 0x3a, 0x61, 0x3a,
        0x62, 0x3a, 0x63,
      ]);
      setupPending({
        userDidAnchors: [{ ...PENDING_DID, documentCbor: cborBytes as unknown as null }],
      });

      const service = container.resolve(AnchorBatchService);
      await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      expect(mockBuildAuxiliaryData).toHaveBeenCalledTimes(1);
      const auxInput = mockBuildAuxiliaryData.mock.calls[0][0];
      expect(auxInput.ops).toHaveLength(1);
      const op = auxInput.ops[0];
      expect(op.k).toBe("c");
      expect(op.docCbor).toBeInstanceOf(Uint8Array);
      expect(Array.from(op.docCbor)).toEqual(Array.from(cborBytes));
      // doc field must not be present when docCbor is supplied
      expect(op.doc).toBeUndefined();
    });

    it("falls back to minimal {id} doc when documentCbor is null (Backfill / §U)", async () => {
      setupPending({
        userDidAnchors: [{ ...PENDING_DID, documentCbor: null }],
      });

      const service = container.resolve(AnchorBatchService);
      await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      const auxInput = mockBuildAuxiliaryData.mock.calls[0][0];
      const op = auxInput.ops[0];
      expect(op.docCbor).toBeUndefined();
      expect(op.doc).toEqual({ id: PENDING_DID.did });
    });

    it("treats empty Uint8Array documentCbor as absent (defensive)", async () => {
      setupPending({
        userDidAnchors: [
          { ...PENDING_DID, documentCbor: new Uint8Array(0) as unknown as null },
        ],
      });

      const service = container.resolve(AnchorBatchService);
      await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      const op = mockBuildAuxiliaryData.mock.calls[0][0].ops[0];
      expect(op.docCbor).toBeUndefined();
      expect(op.doc).toEqual({ id: PENDING_DID.did });
    });

    it("DEACTIVATE op never carries doc/docCbor regardless of stored cbor", async () => {
      setupPending({
        userDidAnchors: [
          {
            ...PENDING_DID,
            operation: DidOperation.DEACTIVATE,
            documentCbor: new Uint8Array([0xa0]) as unknown as null,
            previousAnchorId: null,
          },
        ],
      });

      const service = container.resolve(AnchorBatchService);
      await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

      const op = mockBuildAuxiliaryData.mock.calls[0][0].ops[0];
      expect(op.k).toBe("d");
      expect(op.docCbor).toBeUndefined();
      expect(op.doc).toBeUndefined();
    });
  });
});
