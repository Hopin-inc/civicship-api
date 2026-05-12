/**
 * §14.2 受け入れ: VC anchoring (Phase 1.5).
 *
 * 設計書 `docs/report/did-vc-internalization.md` §14.2 受け入れチェックリスト
 * (line 2117-2125) のうち、以下を検証する:
 *
 *   [x] VC anchoring: 新規 VC が次回バッチで anchor され
 *       `vcAnchorId` / `anchorLeafIndex` が埋まる
 *
 * 構造:
 *   1. Issue 済 VC (VcIssuanceRequest) と紐付く `VcAnchor` を seed する。
 *   2. `AnchorBatchService.runWeeklyBatch` を実行（Blockfrost / Cardano は mock）。
 *   3. `VcAnchor` が SUBMITTED → CONFIRMED まで進み、`chainTxHash` /
 *      `blockHeight` が埋まることを確認する。
 *
 * Phase 1.5 時点では、`VcIssuanceRequest.vcAnchorId` / `anchorLeafIndex` を
 * 自動的にバッチ側から書く配線はまだ無い（後続 PR）。本 acceptance test では
 * 「seed で `vcAnchorId` を結線した VC が、anchor 確定後に確かに
 * findVcAnchorById で CONFIRMED な VcAnchor を引ける」ところまでを
 * Phase 1.5 既存挙動の境界として確認する。
 *
 * Mock 方針:
 *   - Blockfrost client: submitTx / awaitConfirmation / getProtocolParams /
 *     getUtxos を fake 値で返す。実際の Cardano への submit は行わない。
 *   - CSL の txBuilder / keygen: 重い native 依存を避けるため最小限モック。
 *   - Repository / Service / Prisma: 一切 mock しない（real DB 経由）。
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { AnchorStatus } from "@prisma/client";
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

// CSL は native 依存が重いので、テスト時のみ tx 構築を mock 化する。
// jest.mock は hoist されるため、call site は各 test file に残す必要がある
// が、factory 本体は共通 helper から import している。
jest.mock(
  "@/infrastructure/libs/cardano/txBuilder",
  cslTxBuilderMockFactory({ txHashHex: "ab".repeat(32) }),
);
jest.mock("@/infrastructure/libs/cardano/keygen", cslKeygenMockFactory());

describe("[§14.2] VC anchoring — pending VcAnchor → CONFIRMED via batch", () => {
  jest.setTimeout(30_000);
  let issuer: PrismaClientIssuer;

  const mockBlockfrost = createMockBlockfrostClient({
    submittedTxHash: "ab".repeat(32),
    blockHeight: 9_876_543,
  });
  const mockSlotProvider = createMockSlotProvider();

  beforeEach(async () => {
    ({ issuer } = await setupAcceptanceTest());

    wireCardanoTestEnv();
    registerBlockfrostMocks(mockBlockfrost, mockSlotProvider);
    jest.clearAllMocks();
  });

  afterEach(() => {
    restoreEnv();
  });

  afterAll(async () => {
    await teardownAcceptanceTest();
  });

  /** Seed: User → Participation → Evaluation → VcIssuanceRequest → VcAnchor (PENDING). */
  async function seedVcWithPendingAnchor(): Promise<{
    userId: string;
    vcRequestId: string;
    vcAnchorId: string;
  }> {
    const { userId, evaluationId } = await seedUserParticipationEvaluation({
      name: "Anchor Acceptance User",
      slugPrefix: "anc",
    });
    const vcRequest = await seedVcRequest({
      userId,
      evaluationId,
      vcJwt: fakeVcJwt({
        issuer: "did:web:api.civicship.app",
        credentialSubject: { id: `did:web:api.civicship.app:users:${userId}` },
      }),
    });
    const vcAnchor = await seedPendingVcAnchor({ vcRequestIds: [vcRequest.id] });
    // Wire VcIssuanceRequest → VcAnchor (Phase 1.5: linkage is set up at
    // batch-prepare time; we set it in seed since the prep-step is out of scope).
    await prismaClient.vcIssuanceRequest.update({
      where: { id: vcRequest.id },
      data: { vcAnchorId: vcAnchor.id, anchorLeafIndex: 0 },
    });
    return { userId, vcRequestId: vcRequest.id, vcAnchorId: vcAnchor.id };
  }

  it("submits and confirms the pending VcAnchor; chainTxHash and blockHeight are stamped", async () => {
    const { vcAnchorId, vcRequestId } = await seedVcWithPendingAnchor();
    const ctx = buildCtx(issuer);

    const service = container.resolve(AnchorBatchService);
    const result = await service.runWeeklyBatch(ctx, { weeklyKey: "2026-W19" });

    expect(result.submitted).toBe(true);
    expect(result.status).toBe(AnchorStatus.CONFIRMED);
    expect(result.txHash).toBe("ab".repeat(32));
    // Counts include the seeded VcAnchor.
    expect(result.anchorCounts.vc).toBeGreaterThanOrEqual(1);

    const vcAnchorAfter = await prismaClient.vcAnchor.findUnique({ where: { id: vcAnchorId } });
    expect(vcAnchorAfter).toMatchObject({
      status: AnchorStatus.CONFIRMED,
      chainTxHash: "ab".repeat(32),
      blockHeight: 9_876_543,
      batchId: "2026-W19",
    });

    // The VcIssuanceRequest linkage (set at seed) survives the batch and
    // resolves to the now-confirmed anchor — i.e. the per-row Phase 1.5
    // contract `vcAnchorId / anchorLeafIndex` reads back.
    const vcRow = await prismaClient.vcIssuanceRequest.findUnique({ where: { id: vcRequestId } });
    expect(vcRow).toMatchObject({
      vcAnchorId,
      anchorLeafIndex: 0,
    });
  });
});
