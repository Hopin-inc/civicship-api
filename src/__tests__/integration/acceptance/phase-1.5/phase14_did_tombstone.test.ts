/**
 * §14.2 受け入れ: DID Tombstone (Phase 1.5).
 *
 * 設計書 §14.2 (line 2117-2125) のうち:
 *
 *   [x] DID Tombstone: DEACTIVATE 後の DID が `{deactivated: true}` で
 *       200 を返す
 *
 * 構造:
 *   1. UserDidService.createDidForUser → CREATE anchor を seed
 *   2. UserDidService.deactivateDid → DEACTIVATE anchor を seed
 *   3. Express + did router で `GET /users/:userId/did.json` を叩く
 *   4. レスポンスが 200 で `deactivated: true` を含むことを確認
 *
 * 設計書 §E: tombstone は 404 ではなく 200 で返す (verifier が
 * 「user existed and is gone」を「user never existed」と区別できるように)。
 */

import "reflect-metadata";
import { container } from "tsyringe";
import express from "express";
import request from "supertest";
import { CurrentPrefecture } from "@prisma/client";
import { registerProductionDependencies } from "@/application/provider";
import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import UserDidService from "@/application/domain/account/userDid/service";
import didRouter from "@/presentation/router/did";
import { IContext } from "@/types/server";

describe("[§14.2] DID Tombstone — DEACTIVATE returns 200 with deactivated:true", () => {
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

  function makeApp(): express.Express {
    const app = express();
    app.use("/", didRouter);
    return app;
  }

  it("CREATE → DEACTIVATE → GET /users/:userId/did.json returns 200 with deactivated:true (§E)", async () => {
    const ctx = buildCtx();
    const user = await TestDataSourceHelper.createUser({
      name: "Tombstone Acceptance User",
      slug: `tomb-${Date.now()}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const service = container.resolve<UserDidService>("UserDidService");
    await service.createDidForUser(ctx, user.id, undefined, "CARDANO_PREPROD");
    await service.deactivateDid(ctx, user.id, undefined, "CARDANO_PREPROD");

    const app = makeApp();
    const res = await request(app).get(`/users/${user.id}/did.json`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: `did:web:api.civicship.app:users:${user.id}`,
      deactivated: true,
    });
    expect(res.body.proof).toBeDefined();
    // §F still applies — even on tombstones, anchorStatus reflects the row state.
    expect(["pending", "submitted", "confirmed", "failed"]).toContain(
      res.body.proof.anchorStatus,
    );
  });

  it("returns 404 (did_not_found) when no anchor exists for the user", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Never-Anchored User",
      slug: `noanc-${Date.now()}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const app = makeApp();
    const res = await request(app).get(`/users/${user.id}/did.json`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("did_not_found");
  });
});
