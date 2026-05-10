/**
 * Integration tests for `VcIssuanceRepository` (Phase 1.5).
 *
 * Verifies the SQL round-trip for the redesigned (§5.2.2) VC issuance
 * persistence path:
 *
 *   - `create` requires `evaluationId` (schema NOT NULL).
 *   - `claims` is persisted as `{}` for INTERNAL_JWT (canonical claims live
 *     in the JWT payload).
 *   - `completedAt` is stamped when status is `COMPLETED` on insert.
 *   - `findById` decodes `issuerDid` / `subjectDid` from the JWT payload.
 *   - `findByUserId` returns rows ordered by `createdAt DESC`.
 *   - `findById` returns `{ issuerDid: null, subjectDid: null }` (and warn
 *     logs) when the JWT cannot be decoded.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (VcIssuanceRequest schema)
 *   docs/report/did-vc-internalization.md §5.2.2 (Application service flow)
 */

import "reflect-metadata";
import { container } from "tsyringe";
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
import VcIssuanceRepository from "@/application/domain/credential/vcIssuance/data/repository";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";

/**
 * Encode a fake VC JWT with the given issuer / subject so that the
 * repository's payload-decoder (`decodeIssuerSubjectFromJwt`) can recover
 * the DIDs without a real signing key.
 */
function fakeVcJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "ES256K", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

describe("VcIssuanceRepository (integration)", () => {
  jest.setTimeout(30_000);
  let repo: VcIssuanceRepository;
  let issuer: PrismaClientIssuer;
  let userId: string;

  /** Build an Evaluation row (and the Participation it points at) for `userId`. */
  async function createEvaluationFor(theUserId: string): Promise<string> {
    const participation = await prismaClient.participation.create({
      data: {
        status: ParticipationStatus.PARTICIPATED,
        reason: ParticipationStatusReason.PERSONAL_RECORD,
        source: Source.INTERNAL,
        user: { connect: { id: theUserId } },
      },
    });
    const evaluation = await prismaClient.evaluation.create({
      data: {
        status: EvaluationStatus.PASSED,
        participation: { connect: { id: participation.id } },
        evaluator: { connect: { id: theUserId } },
      },
    });
    return evaluation.id;
  }

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    repo = container.resolve<VcIssuanceRepository>("VcIssuanceRepository");

    const user = await TestDataSourceHelper.createUser({
      name: "VC Test User",
      slug: `vc-user-${Date.now()}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    userId = user.id;
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  function buildCtx(): IContext {
    return { issuer } as unknown as IContext;
  }

  describe("create", () => {
    it("throws when evaluationId is missing (schema NOT NULL)", async () => {
      // `evaluationId` is required by the input type but we deliberately
      // omit it here to exercise the runtime guard. Cast to `any` so TS
      // doesn't reject the missing-field shape at compile time.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inputMissingEvaluationId: any = {
        userId,
        issuerDid: "did:web:api.civicship.app",
        subjectDid: `did:web:api.civicship.app:users:${userId}`,
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: "h.p.s",
        status: VcIssuanceStatus.COMPLETED,
      };
      await expect(repo.create(buildCtx(), inputMissingEvaluationId)).rejects.toThrow(
        /evaluationId/,
      );
    });

    it("persists claims as `{}` for INTERNAL_JWT (canonical claims live in vcJwt)", async () => {
      const ctx = buildCtx();
      const evaluationId = await createEvaluationFor(userId);

      const persisted = await repo.create(ctx, {
        userId,
        evaluationId,
        issuerDid: "did:web:api.civicship.app",
        subjectDid: `did:web:api.civicship.app:users:${userId}`,
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: fakeVcJwt({
          issuer: "did:web:api.civicship.app",
          credentialSubject: { id: `did:web:api.civicship.app:users:${userId}` },
        }),
        status: VcIssuanceStatus.COMPLETED,
      });

      const row = await prismaClient.vcIssuanceRequest.findUnique({
        where: { id: persisted.id },
      });
      expect(row).not.toBeNull();
      expect(row!.claims).toEqual({});
      expect(row!.evaluationId).toBe(evaluationId);
      expect(row!.vcFormat).toBe(VcFormat.INTERNAL_JWT);
    });

    it("stamps completedAt when status is COMPLETED", async () => {
      const ctx = buildCtx();
      const evaluationId = await createEvaluationFor(userId);
      const before = new Date();

      const persisted = await repo.create(ctx, {
        userId,
        evaluationId,
        issuerDid: "did:web:api.civicship.app",
        subjectDid: `did:web:api.civicship.app:users:${userId}`,
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: "h.p.s",
        status: VcIssuanceStatus.COMPLETED,
      });

      expect(persisted.completedAt).not.toBeNull();
      // `before` is captured immediately above the `repo.create(...)` call,
      // so `completedAt` must be on or after `before` — strict comparison
      // catches stale-timestamp regressions that a `- 1000` buffer would
      // hide.
      expect(persisted.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("leaves completedAt null when status is not COMPLETED", async () => {
      const ctx = buildCtx();
      const evaluationId = await createEvaluationFor(userId);

      const persisted = await repo.create(ctx, {
        userId,
        evaluationId,
        issuerDid: "did:web:api.civicship.app",
        subjectDid: `did:web:api.civicship.app:users:${userId}`,
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: "h.p.s",
        status: VcIssuanceStatus.PENDING,
      });

      expect(persisted.completedAt).toBeNull();
    });
  });

  describe("findById", () => {
    it("recovers issuerDid and subjectDid from the JWT payload", async () => {
      const ctx = buildCtx();
      const evaluationId = await createEvaluationFor(userId);
      const subjectDid = `did:web:api.civicship.app:users:${userId}`;
      const vcJwt = fakeVcJwt({
        issuer: "did:web:api.civicship.app",
        credentialSubject: { id: subjectDid },
      });

      const persisted = await repo.create(ctx, {
        userId,
        evaluationId,
        issuerDid: "did:web:api.civicship.app",
        subjectDid,
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt,
        status: VcIssuanceStatus.COMPLETED,
      });

      const fetched = await repo.findById(ctx, persisted.id);
      expect(fetched).not.toBeNull();
      expect(fetched!.issuerDid).toBe("did:web:api.civicship.app");
      expect(fetched!.subjectDid).toBe(subjectDid);
    });

    it("returns null + warn-logs when the JWT cannot be decoded", async () => {
      const ctx = buildCtx();
      const evaluationId = await createEvaluationFor(userId);
      const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => logger);

      // Persist a row with a deliberately malformed JWT (only one segment).
      const persisted = await repo.create(ctx, {
        userId,
        evaluationId,
        issuerDid: "did:web:api.civicship.app",
        subjectDid: `did:web:api.civicship.app:users:${userId}`,
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: "not-a-jwt",
        status: VcIssuanceStatus.COMPLETED,
      });

      const fetched = await repo.findById(ctx, persisted.id);
      expect(fetched).not.toBeNull();
      expect(fetched!.issuerDid).toBeNull();
      expect(fetched!.subjectDid).toBeNull();
      // Verify the warn carried the diagnostic context we expect operators
      // to grep on (`vcRequestId`) — a bare `toHaveBeenCalled()` would pass
      // even if a future refactor stripped the structured payload.
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("vcJwt"),
        expect.objectContaining({ vcRequestId: persisted.id }),
      );

      warnSpy.mockRestore();
    });
  });

  describe("findByUserId", () => {
    it("returns rows ordered by createdAt DESC", async () => {
      const ctx = buildCtx();
      const firstEvaluation = await createEvaluationFor(userId);
      const first = await repo.create(ctx, {
        userId,
        evaluationId: firstEvaluation,
        issuerDid: "did:web:api.civicship.app",
        subjectDid: `did:web:api.civicship.app:users:${userId}`,
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: "h.p.s",
        status: VcIssuanceStatus.COMPLETED,
      });

      // Schema enforces `evaluationId` UNIQUE, so seed a second Evaluation
      // for the same user via the existing helper — keeps both VC rows
      // owned by `userId` without an unrelated otherUser hop.
      const secondEvaluationId = await createEvaluationFor(userId);

      await new Promise((r) => setTimeout(r, 10));

      const second = await repo.create(ctx, {
        userId,
        evaluationId: secondEvaluationId,
        issuerDid: "did:web:api.civicship.app",
        subjectDid: `did:web:api.civicship.app:users:${userId}`,
        vcFormat: VcFormat.INTERNAL_JWT,
        vcJwt: "h.p.s",
        status: VcIssuanceStatus.COMPLETED,
      });

      const rows = await repo.findByUserId(ctx, userId);
      expect(rows.map((r) => r.id)).toEqual([second.id, first.id]);
    });

    it("returns empty array when no VCs exist", async () => {
      const ctx = buildCtx();
      const rows = await repo.findByUserId(ctx, userId);
      expect(rows).toEqual([]);
    });
  });
});
