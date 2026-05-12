/**
 * §14.2 受け入れ: PENDING DID 配信 (Phase 1.5).
 *
 * 設計書 §14.2 (line 2117-2125) のうち:
 *
 *   [x] PENDING DID 配信: 新規 DID 発行直後 (anchor 前) でも
 *       `/users/:id/did.json` が 200 で `proof.anchorStatus: "pending"` を返す
 *
 * 構造:
 *   1. UserDidService.createDidForUser → PENDING な CREATE anchor を seed
 *   2. Express + did router で `GET /users/:userId/did.json` を叩く
 *   3. 200 と proof.anchorStatus === "pending" を確認
 *   4. anchorTxHash / anchoredAt / verificationUrl は null であることも確認
 *
 * 設計書 §F: PENDING でも即座に Document を返す。anchorStatus で trust level
 * を伝達する設計（confirmation 待ちで blocking しない）。
 */

import "reflect-metadata";
import { container } from "tsyringe";
import express from "express";
import request from "supertest";
import { AnchorStatus, CurrentPrefecture } from "@prisma/client";
import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import UserDidService from "@/application/domain/account/userDid/service";
import didRouter from "@/presentation/router/did";
import {
  buildCtx,
  setupAcceptanceTest,
  teardownAcceptanceTest,
} from "@/__tests__/integration/acceptance/phase-1.5/__helpers__/setup";

describe("[§14.2] PENDING DID serving — fresh anchor returns 200 with proof.anchorStatus pending (§F)", () => {
  jest.setTimeout(30_000);
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    ({ issuer } = await setupAcceptanceTest());
  });

  afterAll(async () => {
    await teardownAcceptanceTest();
  });

  it("returns 200 with proof.anchorStatus pending immediately after createDid", async () => {
    const ctx = buildCtx(issuer);
    const user = await TestDataSourceHelper.createUser({
      name: "Pending DID Acceptance User",
      slug: `pend-${Date.now()}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const service = container.resolve<UserDidService>("UserDidService");
    const created = await service.createDidForUser(ctx, user.id, undefined, "CARDANO_PREPROD");

    // Sanity: row is PENDING (no batch has run yet).
    const row = await prismaClient.userDidAnchor.findUnique({ where: { id: created.id } });
    expect(row).toMatchObject({
      status: AnchorStatus.PENDING,
      chainTxHash: null,
      confirmedAt: null,
    });

    const app = express();
    app.use("/", didRouter);
    const res = await request(app).get(`/users/${user.id}/did.json`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: `did:web:api.civicship.app:users:${user.id}`,
    });
    expect(res.body.proof).toMatchObject({
      type: "DataIntegrityProof",
      cryptosuite: "civicship-merkle-anchor-2026",
      anchorChain: "cardano:preprod",
      anchorStatus: "pending",
      anchorTxHash: null,
      opIndexInTx: null,
      anchoredAt: null,
      verificationUrl: null,
    });
    // docHash is the Blake2b-256 of the CBOR-encoded minimal Document.
    expect(typeof res.body.proof.docHash).toBe("string");
    expect(res.body.proof.docHash).toHaveLength(64);
  });
});
