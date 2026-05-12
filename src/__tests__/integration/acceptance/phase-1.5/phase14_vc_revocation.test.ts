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
import { prismaClient, PrismaClientIssuer } from "@/infrastructure/prisma/client";
import StatusListService from "@/application/domain/credential/statusList/service";
import StatusListUseCase from "@/application/domain/credential/statusList/usecase";
import credentialsRouter from "@/presentation/router/credentials";
import {
  buildCtx,
  seedUserParticipationEvaluation,
  seedVcRequest,
  setupAcceptanceTest,
  teardownAcceptanceTest,
} from "@/__tests__/integration/acceptance/phase-1.5/__helpers__/setup";

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
    ({ issuer } = await setupAcceptanceTest());
  });

  afterAll(async () => {
    await teardownAcceptanceTest();
  });

  it("revokeVc flips the bit, /credentials/status/:listKey.jwt reflects it, revokedAt is stamped", async () => {
    const ctx = buildCtx(issuer);
    const { userId, evaluationId } = await seedUserParticipationEvaluation({
      name: "Revocation Acceptance User",
      slugPrefix: "rev",
    });

    // 1. allocate a real slot (this also bootstraps a fresh StatusList).
    const statusListUseCase = container.resolve(StatusListUseCase);
    const slot = await statusListUseCase.allocateNextSlot(ctx);
    expect(slot.statusListIndex).toBe(0);
    expect(slot.listKey).toBe("1");

    // 2. seed VC pointing at the slot.
    const vc = await seedVcRequest({
      userId,
      evaluationId,
      vcJwt: "header.payload.sig",
      statusListIndex: slot.statusListIndex,
      statusListCredential: slot.statusListCredentialUrl,
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
    expect(after).toMatchObject({
      revocationReason: "test-revoke",
    });
    expect(after?.revokedAt).not.toBeNull();
  });

  it("StatusListService.revokeVc throws when the VC has no statusList wiring", async () => {
    const ctx = buildCtx(issuer);
    const { userId, evaluationId } = await seedUserParticipationEvaluation({
      name: "Revocation Acceptance User",
      slugPrefix: "rev",
    });
    const vc = await seedVcRequest({
      userId,
      evaluationId,
      vcJwt: "h.p.s",
      // statusListIndex / statusListCredential intentionally omitted.
    });

    const service = container.resolve<StatusListService>("StatusListService");
    await expect(service.revokeVc(ctx, { vcRequestId: vc.id })).rejects.toThrow(
      /no statusList wiring/,
    );
  });
});
