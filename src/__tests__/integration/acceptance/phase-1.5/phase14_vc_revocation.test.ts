/**
 * §14.2 受け入れ: VC revocation (Phase 1.5).
 *
 * 設計書 §14.2 (line 2117-2125) のうち:
 *
 *   [x] VC revocation: revokeVc API → StatusList VC が再署名 →
 *       `/credentials/status/:key.jwt` で revoked bit が反映 →
 *       verifier で revoked 判定
 *
 * 構造:
 *   1. StatusListService.allocateNextSlot で新規 list bootstrap + slot 確保
 *   2. その slot に紐付く VcIssuanceRequest を seed
 *   3. StatusListUseCase.revokeVc 実行
 *   4. credentials router の `GET /status/:listKey.jwt` で再署名された
 *      JWT を取り、payload を decode して bit が立っていることを確認
 *   5. VcIssuanceRequest.revokedAt が stamp されていることも確認
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { gunzipSync } from "node:zlib";
import express from "express";
import request from "supertest";
import {
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
import StatusListService from "@/application/domain/credential/statusList/service";
import StatusListUseCase from "@/application/domain/credential/statusList/usecase";
import credentialsRouter from "@/presentation/router/credentials";
import { IContext } from "@/types/server";

/**
 * Read bit `index` from a Status List 2021 bitstring. Bit ordering: bit 0 is
 * the MSB of byte 0 (mirrors `setBit` in StatusListService).
 */
function readBit(bitstring: Uint8Array, index: number): number {
  const byteIdx = Math.floor(index / 8);
  const bitOffset = index % 8;
  const mask = 0x80 >> bitOffset;
  return (bitstring[byteIdx] & mask) === 0 ? 0 : 1;
}

function decodeStatusListJwt(jwt: string): Record<string, unknown> {
  const [, payloadSeg] = jwt.split(".");
  return JSON.parse(Buffer.from(payloadSeg, "base64url").toString("utf8")) as Record<
    string,
    unknown
  >;
}

describe("[§14.2] VC revocation — revokeVc flips StatusList bit and re-signs the list JWT", () => {
  jest.setTimeout(30_000);
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  function buildCtx(): IContext {
    return { issuer } as unknown as IContext;
  }

  async function seedUserAndEvaluation(): Promise<{ userId: string; evaluationId: string }> {
    const user = await TestDataSourceHelper.createUser({
      name: "Revocation Acceptance User",
      slug: `rev-${Date.now()}`,
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
    return { userId: user.id, evaluationId: evaluation.id };
  }

  it("revokeVc flips the bit, /credentials/status/:listKey.jwt reflects it, revokedAt is stamped", async () => {
    const ctx = buildCtx();
    const { userId, evaluationId } = await seedUserAndEvaluation();

    // 1. allocate a real slot (this also bootstraps a fresh StatusList).
    const statusListUseCase = container.resolve(StatusListUseCase);
    const slot = await statusListUseCase.allocateNextSlot(ctx);
    expect(slot.statusListIndex).toBe(0);
    expect(slot.listKey).toBe("1");

    // 2. seed VC pointing at the slot.
    const vc = await prismaClient.vcIssuanceRequest.create({
      data: {
        user: { connect: { id: userId } },
        evaluation: { connect: { id: evaluationId } },
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: "header.payload.sig",
        status: VcIssuanceStatus.COMPLETED,
        completedAt: new Date(),
        claims: {},
        statusListIndex: slot.statusListIndex,
        statusListCredential: slot.statusListCredentialUrl,
      },
    });

    // 3. revoke via the public usecase.
    await statusListUseCase.revokeVc(ctx, { vcRequestId: vc.id, reason: "test-revoke" });

    // 4. fetch the re-signed StatusList JWT through the public REST router
    //    and confirm the bit is set in the encoded list.
    const app = express();
    app.use("/credentials", credentialsRouter);
    const res = await request(app).get(`/credentials/status/${slot.listKey}.jwt`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/jwt/);
    const jwt = res.text;
    expect(typeof jwt).toBe("string");
    expect(jwt.split(".").length).toBe(3);

    const payload = decodeStatusListJwt(jwt) as {
      credentialSubject?: { encodedList?: string };
    };
    const encodedListB64Url = payload.credentialSubject?.encodedList;
    expect(typeof encodedListB64Url).toBe("string");
    const compressed = Buffer.from(encodedListB64Url!, "base64url");
    const bitstring = new Uint8Array(gunzipSync(compressed));
    expect(readBit(bitstring, slot.statusListIndex)).toBe(1);
    // Sanity: a neighbouring bit stays 0.
    expect(readBit(bitstring, slot.statusListIndex + 1)).toBe(0);

    // 5. the issuance row records revocation locally so back-office queries
    //    can filter without scanning the StatusList JWT.
    const after = await prismaClient.vcIssuanceRequest.findUnique({ where: { id: vc.id } });
    expect(after!.revokedAt).not.toBeNull();
    expect(after!.revocationReason).toBe("test-revoke");
  });

  it("StatusListService.revokeVc throws when the VC has no statusList wiring", async () => {
    const ctx = buildCtx();
    const { userId, evaluationId } = await seedUserAndEvaluation();
    const vc = await prismaClient.vcIssuanceRequest.create({
      data: {
        user: { connect: { id: userId } },
        evaluation: { connect: { id: evaluationId } },
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: "h.p.s",
        status: VcIssuanceStatus.COMPLETED,
        completedAt: new Date(),
        claims: {},
        // statusListIndex / statusListCredential intentionally null.
      },
    });

    const service = container.resolve<StatusListService>("StatusListService");
    await expect(service.revokeVc(ctx, { vcRequestId: vc.id })).rejects.toThrow(
      /no statusList wiring/,
    );
  });
});
