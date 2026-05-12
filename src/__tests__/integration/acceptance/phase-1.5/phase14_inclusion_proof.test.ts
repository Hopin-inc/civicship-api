/**
 * §14.2 受け入れ: VC inclusion proof (Phase 1.5).
 *
 * 設計書 §14.2 (line 2117-2125) のうち:
 *
 *   [x] VC inclusion proof: `/vc/:vcId/inclusion-proof` が proof を返し、
 *       ローカル検証で root と一致する
 *
 * 構造:
 *   1. VcIssuanceRequest (vcJwt 持ち) を複数 seed して Merkle leaf 集合を作る
 *   2. canonical sort + buildRoot で root を計算し、CONFIRMED な VcAnchor として seed
 *   3. Express + did router を立てて `GET /vc/:vcId/inclusion-proof` を叩く
 *   4. レスポンスの proofPath を decode し、`verifyProof` でローカル再計算した
 *      root が anchor の rootHash と一致することを確認
 *
 * Mock 方針: 一切なし（route → usecase → service → repository を real DB で通す）。
 */

import "reflect-metadata";
import express from "express";
import request from "supertest";
import { AnchorStatus, ChainNetwork } from "@prisma/client";
import { prismaClient } from "@/infrastructure/prisma/client";
import didRouter from "@/presentation/router/did";
import { buildRoot, verifyProof } from "@/infrastructure/libs/merkle/merkleTreeBuilder";
import {
  fakeVcJwt,
  seedUserParticipationEvaluation,
  seedVcRequest,
  setupAcceptanceTest,
  teardownAcceptanceTest,
} from "@/__tests__/integration/acceptance/phase-1.5/__helpers__/setup";

describe("[§14.2] VC inclusion proof — GET /vc/:vcId/inclusion-proof returns a verifying Merkle proof", () => {
  jest.setTimeout(30_000);

  beforeEach(async () => {
    await setupAcceptanceTest();
  });

  afterAll(async () => {
    await teardownAcceptanceTest();
  });

  function makeApp(): express.Express {
    const app = express();
    app.use("/", didRouter);
    return app;
  }

  /** Seed `count` VC issuance rows owned by a fresh user. Returns the rows. */
  async function seedVcRequests(count: number) {
    const { userId, evaluationId } = await seedUserParticipationEvaluation({
      name: "Inclusion Proof User",
      slugPrefix: "incl",
    });
    const rows: { id: string; vcJwt: string }[] = [];
    for (let i = 0; i < count; i += 1) {
      // Deterministic salt (no Math.random — fixes Sonar S2245).
      // The index already guarantees uniqueness across rows in this seed call,
      // and `setupAcceptanceTest` wipes the DB before each test, so collision
      // across tests is impossible.
      const vcJwt = fakeVcJwt(
        {
          issuer: "did:web:api.civicship.app",
          credentialSubject: { id: `did:web:api.civicship.app:users:${userId}`, idx: i },
        },
        `incl-${i}`,
      );
      const vcRequest = await seedVcRequest({ userId, evaluationId, vcJwt });
      rows.push({ id: vcRequest.id, vcJwt });
    }
    return rows;
  }

  it("returns 200 with a Merkle proof whose path verifies against the anchored root", async () => {
    const rows = await seedVcRequests(4);

    // Replay the canonical (ASCII byte order) leaf sort used in
    // AnchorBatchService.buildVcRoot / VcIssuanceService.generateInclusionProof.
    const sortedJwts = [...rows.map((r) => r.vcJwt)].sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
    const rootBytes = buildRoot(sortedJwts);
    const rootHex = Buffer.from(rootBytes).toString("hex");

    const vcAnchor = await prismaClient.vcAnchor.create({
      data: {
        periodStart: new Date("2026-05-01T00:00:00Z"),
        periodEnd: new Date("2026-05-08T00:00:00Z"),
        rootHash: rootHex,
        leafIds: rows.map((r) => r.id),
        leafCount: rows.length,
        network: ChainNetwork.CARDANO_PREPROD,
        status: AnchorStatus.CONFIRMED,
        chainTxHash: "ef".repeat(32),
        blockHeight: 1_111_111,
        batchId: "2026-W19",
        submittedAt: new Date(),
        confirmedAt: new Date(),
      },
    });

    const target = rows[2];
    await prismaClient.vcIssuanceRequest.update({
      where: { id: target.id },
      data: { vcAnchorId: vcAnchor.id, anchorLeafIndex: sortedJwts.indexOf(target.vcJwt) },
    });

    const app = makeApp();
    const res = await request(app).get(`/vc/${target.id}/inclusion-proof`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      vcId: target.id,
      vcJwt: target.vcJwt,
      vcAnchorId: vcAnchor.id,
      rootHash: rootHex,
      chainTxHash: "ef".repeat(32),
      blockHeight: 1_111_111,
    });
    expect(Array.isArray(res.body.proofPath)).toBe(true);
    expect(typeof res.body.leafIndex).toBe("number");

    // Local verification: re-compute root from the returned proof and assert
    // it matches the on-chain rootHash. This is exactly the round-trip a
    // verifier client (civicship-portal) would perform.
    //
    // The §5.1.7 leaf canonicalisation hashes the VC JWT string itself
    // (`canonicalLeafHash(jwt)`); the proof path was computed on
    // `sortedJwts`, so `verifyProof` must receive the JWT at `leafIndex`.
    const proofBytes = (res.body.proofPath as string[]).map((hex) =>
      Uint8Array.from(Buffer.from(hex, "hex")),
    );
    const ok = verifyProof(
      sortedJwts[res.body.leafIndex],
      res.body.leafIndex,
      proofBytes,
      Uint8Array.from(Buffer.from(rootHex, "hex")),
    );
    expect(ok).toBe(true);
  });

  it("returns 404 (not_anchored) when the VC has no anchor yet", async () => {
    const rows = await seedVcRequests(1);
    const app = makeApp();
    const res = await request(app).get(`/vc/${rows[0].id}/inclusion-proof`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_anchored");
  });
});
