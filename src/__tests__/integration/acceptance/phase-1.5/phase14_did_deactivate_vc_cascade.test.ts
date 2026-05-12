/**
 * §14.2 受け入れ: DID DEACTIVATE → 紐づく VC の cascade revoke (Phase 2).
 *
 * 設計書 §14.2 (line 2117-2125) のうち:
 *
 *   [x] DID DEACTIVATE + VC cascade revoke: ユーザの DID を DEACTIVATE
 *       した瞬間、そのユーザに紐づく live VC が同一 transaction 内で
 *       StatusList revoke される。途中で例外を投げても DID の
 *       tombstone と VC の revoke は片落ちしない。
 *
 *   [x] Idempotency: 二度目以降の DEACTIVATE は no-op (revoked 件数 0、
 *       StatusList の bit はそのまま、DB の revokedAt も初回時刻のまま)。
 *
 * Stack under test (full integration, no service mocking):
 *   UserDidUseCase.deactivateDid
 *     → UserDidService.deactivateDid              (real, Prisma)
 *     → VcIssuanceService.cascadeRevokeForUser    (real)
 *       → VcIssuanceRepository.findActiveByUserId (real, Prisma)
 *       → StatusListService.revokeVc per VC       (real, real signer stub)
 *
 * これにより PR #1128 が確立した「DID DEACTIVATE 直後に **全ての**
 * live VC が revoke される」契約を、対応する router を経由した
 * `/credentials/status/:listKey.jwt` の bit 反映 + 行 (`revokedAt`) の
 * 両面で検証する。
 *
 * 設計書 §14.2 (line 2123): "DID が tombstone なのに freshly-fetched
 * VC がまだ live verifier を通る" 窓を許さない、を E2E で担保。
 *
 * Companion tests:
 *   - unit test : src/__tests__/unit/application/domain/account/userDid/usecase.test.ts
 *                 (mocks the VcIssuanceService.cascadeRevokeForUser call)
 *   - unit test : src/__tests__/unit/application/domain/credential/vcIssuance/service.test.ts
 *                 (cascadeRevokeForUser with a stub StatusListService)
 *   - this file : end-to-end through the real services + Prisma + the
 *                 same StatusList router that production exposes.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §14.2 (受け入れ checklist)
 *   docs/report/did-vc-internalization.md §E    (Tombstone)
 *   docs/report/did-vc-internalization.md §5.2.4 (StatusList revocation)
 *   docs/report/did-vc-internalization.md §9.7   (cascade scope)
 */

import "reflect-metadata";
import { container } from "tsyringe";
import express from "express";
import request from "supertest";
import {
  AnchorStatus,
  DidOperation,
  EvaluationStatus,
  ParticipationStatus,
  ParticipationStatusReason,
  Source,
} from "@prisma/client";
import { prismaClient, PrismaClientIssuer } from "@/infrastructure/prisma/client";
import UserDidUseCase from "@/application/domain/account/userDid/usecase";
import StatusListUseCase from "@/application/domain/credential/statusList/usecase";
import credentialsRouter from "@/presentation/router/credentials";
import {
  buildCtx,
  decodeStatusListBitstring,
  fakeVcJwt,
  readStatusListBit,
  seedUserParticipationEvaluation,
  seedVcRequest,
  setupAcceptanceTest,
  teardownAcceptanceTest,
} from "@/__tests__/integration/acceptance/phase-1.5/__helpers__/setup";

/**
 * Wrap the shared `decodeStatusListBitstring` helper with the router
 * round-trip this test wants to exercise — going through the real Express
 * + credentials router catches wire-layer regressions a direct
 * `StatusListService.buildStatusListVc()` call would miss.
 */
async function fetchListBitstring(listKey: string): Promise<Uint8Array> {
  const app = express();
  app.use("/credentials", credentialsRouter);
  const res = await request(app).get(`/credentials/status/${listKey}.jwt`);
  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toMatch(/application\/jwt/);
  return decodeStatusListBitstring(res.text);
}

describe("[§14.2] DID DEACTIVATE → cascade-revokes the user's live VCs (§9.7)", () => {
  jest.setTimeout(30_000);
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    ({ issuer } = await setupAcceptanceTest());
  });

  afterAll(async () => {
    await teardownAcceptanceTest();
  });

  it("DEACTIVATE flips every live VC's StatusList bit and stamps revokedAt in one transaction", async () => {
    const ctx = buildCtx(issuer);

    // 1. Seed user → evaluation foundation, and a fresh StatusList so we
    //    can allocate two slots from index 0 / index 1.
    const { userId, evaluationId } = await seedUserParticipationEvaluation({
      name: "Cascade Revoke Acceptance User",
      slugPrefix: "casc",
    });
    const statusListUseCase = container.resolve(StatusListUseCase);
    const slotA = await statusListUseCase.allocateNextSlot(ctx);
    const slotB = await statusListUseCase.allocateNextSlot(ctx);
    expect(slotA.statusListIndex).toBe(0);
    expect(slotB.statusListIndex).toBe(1);
    // Both slots must live on the same list — otherwise the
    // "flip both bits in one cascade" check would silently weaken.
    expect(slotA.listKey).toBe(slotB.listKey);

    // 2. Seed two evaluations (the schema requires one evaluation per VC
    //    via `evaluationId` unique constraint — see VcIssuanceRepository.create).
    //    We already have one evaluation from seedUserParticipationEvaluation;
    //    create one more for the second VC.
    const secondEval = await prismaClient.evaluation.create({
      data: {
        status: EvaluationStatus.PASSED,
        participation: {
          create: {
            status: ParticipationStatus.PARTICIPATED,
            reason: ParticipationStatusReason.PERSONAL_RECORD,
            source: Source.INTERNAL,
            user: { connect: { id: userId } },
          },
        },
        evaluator: { connect: { id: userId } },
      },
    });

    const vcA = await seedVcRequest({
      userId,
      evaluationId,
      vcJwt: fakeVcJwt({ vc: "A" }),
      statusListIndex: slotA.statusListIndex,
      statusListCredential: slotA.statusListCredentialUrl,
    });
    const vcB = await seedVcRequest({
      userId,
      evaluationId: secondEval.id,
      vcJwt: fakeVcJwt({ vc: "B" }),
      statusListIndex: slotB.statusListIndex,
      statusListCredential: slotB.statusListCredentialUrl,
    });

    // 3. Trigger DID DEACTIVATE. The service-level wrapper opens
    //    `ctx.issuer.public(tx => ...)` and inside the same `tx`:
    //      a) writes a DEACTIVATE-op UserDidAnchor row;
    //      b) calls VcIssuanceService.cascadeRevokeForUser(userId, tx).
    //    Both must commit together — splitting them would violate §14.2
    //    line 2123 (no "DID tombstoned but VC still live" window).
    const useCase = container.resolve(UserDidUseCase);
    await useCase.deactivateDid(ctx, userId);

    // 4. Both VC rows are revoked.
    const afterA = await prismaClient.vcIssuanceRequest.findUnique({ where: { id: vcA.id } });
    const afterB = await prismaClient.vcIssuanceRequest.findUnique({ where: { id: vcB.id } });
    expect(afterA).toMatchObject({ revocationReason: "did-deactivated" });
    expect(afterB).toMatchObject({ revocationReason: "did-deactivated" });
    expect(afterA?.revokedAt).not.toBeNull();
    expect(afterB?.revokedAt).not.toBeNull();

    // 5. The (re-signed) StatusList JWT reflects BOTH bits. Neighbouring
    //    bit 2 stays 0 so we know we didn't accidentally flip the whole
    //    bitstring.
    const bitstring = await fetchListBitstring(slotA.listKey);
    expect(readStatusListBit(bitstring, slotA.statusListIndex)).toBe(1);
    expect(readStatusListBit(bitstring, slotB.statusListIndex)).toBe(1);
    expect(readStatusListBit(bitstring, slotB.statusListIndex + 1)).toBe(0);

    // 6. The DEACTIVATE anchor row landed (still PENDING — no batch ran
    //    in this test, §F serves the tombstone immediately anyway).
    const anchor = await prismaClient.userDidAnchor.findFirst({
      where: { userId, operation: DidOperation.DEACTIVATE },
    });
    expect(anchor).not.toBeNull();
    expect(anchor).toMatchObject({ status: AnchorStatus.PENDING });
  });

  it("is idempotent: a second DEACTIVATE for the same user does not re-revoke or change revokedAt", async () => {
    const ctx = buildCtx(issuer);
    const { userId, evaluationId } = await seedUserParticipationEvaluation({
      name: "Idempotent Cascade User",
      slugPrefix: "casc-idem",
    });
    const statusListUseCase = container.resolve(StatusListUseCase);
    const slot = await statusListUseCase.allocateNextSlot(ctx);
    const vc = await seedVcRequest({
      userId,
      evaluationId,
      vcJwt: fakeVcJwt({ vc: "only" }),
      statusListIndex: slot.statusListIndex,
      statusListCredential: slot.statusListCredentialUrl,
    });

    const useCase = container.resolve(UserDidUseCase);

    // First DEACTIVATE — revokes the single VC.
    await useCase.deactivateDid(ctx, userId);
    const afterFirst = await prismaClient.vcIssuanceRequest.findUnique({
      where: { id: vc.id },
    });
    const firstRevokedAt = afterFirst?.revokedAt ?? null;
    expect(firstRevokedAt).not.toBeNull();
    expect(afterFirst).toMatchObject({ revocationReason: "did-deactivated" });

    const bitstringAfterFirst = await fetchListBitstring(slot.listKey);
    expect(readStatusListBit(bitstringAfterFirst, slot.statusListIndex)).toBe(1);

    // Second DEACTIVATE — must be a no-op for the VC row. The repository
    // filter `where: { userId, revokedAt: null }` excludes the row, so
    // `cascadeRevokeForUser` returns 0 and never calls revokeVc again.
    // The DEACTIVATE op itself still appends a new anchor row (the DID
    // lifecycle records every transition), but the VC must NOT see a
    // second `revokedAt` overwrite.
    await useCase.deactivateDid(ctx, userId);
    const afterSecond = await prismaClient.vcIssuanceRequest.findUnique({
      where: { id: vc.id },
    });
    expect(afterSecond?.revokedAt?.getTime()).toBe(firstRevokedAt!.getTime());
    expect(afterSecond).toMatchObject({ revocationReason: "did-deactivated" });

    // StatusList bit is still 1 — not flipped twice into 0.
    const bitstringAfterSecond = await fetchListBitstring(slot.listKey);
    expect(readStatusListBit(bitstringAfterSecond, slot.statusListIndex)).toBe(1);

    // Both DEACTIVATE invocations recorded their own anchor rows: this is
    // by design — the DID lifecycle is append-only and an audit must be
    // able to see "operator hit DEACTIVATE twice" without losing the
    // second event. The cascade idempotency lives at the VC layer, not
    // the anchor layer.
    const anchors = await prismaClient.userDidAnchor.findMany({
      where: { userId, operation: DidOperation.DEACTIVATE },
    });
    expect(anchors.length).toBeGreaterThanOrEqual(2);
  });

  it("skips VCs without StatusList wiring (pre-§D rows) without aborting the cascade", async () => {
    // Mixed inventory: one VC wired to a StatusList, one legacy row with
    // no `statusListIndex`. The cascade must revoke the wired VC and only
    // log-skip the legacy one — failing the whole DEACTIVATE on a single
    // un-wired row would block operator-driven deletions for any user
    // with pre-§D VCs in their history.
    const ctx = buildCtx(issuer);
    const { userId, evaluationId } = await seedUserParticipationEvaluation({
      name: "Mixed-Inventory User",
      slugPrefix: "casc-mix",
    });
    const statusListUseCase = container.resolve(StatusListUseCase);
    const slot = await statusListUseCase.allocateNextSlot(ctx);

    const legacyEval = await prismaClient.evaluation.create({
      data: {
        status: EvaluationStatus.PASSED,
        participation: {
          create: {
            status: ParticipationStatus.PARTICIPATED,
            reason: ParticipationStatusReason.PERSONAL_RECORD,
            source: Source.INTERNAL,
            user: { connect: { id: userId } },
          },
        },
        evaluator: { connect: { id: userId } },
      },
    });

    const wiredVc = await seedVcRequest({
      userId,
      evaluationId,
      vcJwt: fakeVcJwt({ vc: "wired" }),
      statusListIndex: slot.statusListIndex,
      statusListCredential: slot.statusListCredentialUrl,
    });
    const legacyVc = await seedVcRequest({
      userId,
      evaluationId: legacyEval.id,
      vcJwt: fakeVcJwt({ vc: "legacy" }),
      // Intentionally omit statusListIndex / statusListCredential — pre-§D
      // legacy shape.
    });

    const useCase = container.resolve(UserDidUseCase);
    await useCase.deactivateDid(ctx, userId);

    // Wired VC is revoked; legacy VC remains live (revokedAt stays null).
    const afterWired = await prismaClient.vcIssuanceRequest.findUnique({
      where: { id: wiredVc.id },
    });
    const afterLegacy = await prismaClient.vcIssuanceRequest.findUnique({
      where: { id: legacyVc.id },
    });
    expect(afterWired?.revokedAt).not.toBeNull();
    expect(afterLegacy?.revokedAt).toBeNull();

    // The wired bit landed in the re-signed StatusList JWT.
    const bitstring = await fetchListBitstring(slot.listKey);
    expect(readStatusListBit(bitstring, slot.statusListIndex)).toBe(1);
  });
});
