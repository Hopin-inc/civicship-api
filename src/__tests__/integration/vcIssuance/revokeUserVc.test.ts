/**
 * `Mutation.revokeUserVc` GraphQL integration tests (Phase 1.5).
 *
 * Covers the full Apollo + AuthZ + Resolver path with the usecase
 * mocked via tsyringe (the same pattern as `vcIssuance.test.ts`).
 *
 * Cases (per the Phase 1.5 task brief):
 *   - Admin → 200 + presented VC with `revokedAt` populated.
 *   - Non-admin / unauthenticated → FORBIDDEN (IsAdmin gate).
 *   - Missing vcId → NOT_FOUND surfaced from the usecase's
 *     `NotFoundError` (the `revokeUserVc` non-null payload means an
 *     errors-array response, not `data: null`).
 *   - Idempotent re-revoke → returns the existing snapshot unchanged.
 *
 * The transactional / StatusList wiring is exercised in the unit tests
 * (`__tests__/unit/application/domain/credential/vcIssuance/usecase.test.ts`);
 * here we only verify the GraphQL surface.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { createApolloTestServer } from "@/__tests__/helper/test-server";
import request from "supertest";
import path from "path";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { NotFoundError } from "@/errors/graphql";

jest.mock("@/presentation/graphql/scalar", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/presentation/graphql/schema/esmPath", () => ({
  getESMDirname: jest.fn(() => path.resolve(__dirname, "../../../../src/presentation/graphql/schema")),
}));

jest.mock("@/application/domain/utils", () => ({
  getCurrentUserId: jest.fn(() => "admin-1"),
}));

const REVOKE_MUTATION = /* GraphQL */ `
  mutation ($input: RevokeUserVcInput!) {
    revokeUserVc(input: $input) {
      id
      userId
      status
      revokedAt
    }
  }
`;

const baseRevokedVc = {
  __typename: "VcIssuance" as const,
  id: "vc-1",
  userId: "user-1",
  evaluationId: null,
  issuerDid: "did:web:api.civicship.app",
  subjectDid: "did:web:api.civicship.app:users:user-1",
  vcFormat: "INTERNAL_JWT",
  vcJwt: "h.p.s",
  // Phase 1.5: persisted `status` stays `COMPLETED` — the
  // `VcIssuanceStatus.REVOKED` enum value lands in a follow-up schema
  // PR. Verifiers detect revocation via the StatusList JWT.
  status: "COMPLETED",
  statusListIndex: 0,
  statusListCredential: "https://api.civicship.app/credentials/status/1.jwt",
  revokedAt: new Date("2026-05-10T12:00:00Z"),
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

let issuer: PrismaClientIssuer;

const mockVcIssuanceUseCase = {
  viewVcIssuance: jest.fn(),
  viewVcIssuancesByUser: jest.fn(),
  issueVc: jest.fn(),
  revokeUserVc: jest.fn(),
};

describe("Mutation revokeUserVc (Phase 1.5)", () => {
  beforeAll(() => {
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    container.register("VcIssuanceUseCase", { useValue: mockVcIssuanceUseCase });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authorization (IsAdmin)", () => {
    it("invokes the usecase when the caller is admin and returns the revoked VC", async () => {
      mockVcIssuanceUseCase.revokeUserVc.mockResolvedValueOnce(baseRevokedVc);

      const app = await createApolloTestServer({
        isAdmin: true,
        currentUser: { id: "admin-1", sysRole: "SYS_ADMIN" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: REVOKE_MUTATION,
          variables: {
            input: { vcId: "vc-1", reason: "user-requested" },
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.revokeUserVc).toMatchObject({
        id: "vc-1",
        userId: "user-1",
      });
      // `revokedAt` round-trips through the `Datetime` scalar; assert it
      // is populated rather than asserting an exact serialized form,
      // which depends on the scalar's encoding.
      expect(res.body.data.revokeUserVc.revokedAt).toBeTruthy();
      expect(mockVcIssuanceUseCase.revokeUserVc).toHaveBeenCalledTimes(1);
      expect(mockVcIssuanceUseCase.revokeUserVc).toHaveBeenCalledWith(
        expect.anything(),
        { vcId: "vc-1", reason: "user-requested" },
      );
    });

    it("rejects non-admin callers with FORBIDDEN before reaching the usecase", async () => {
      const app = await createApolloTestServer({
        currentUser: { id: "user-1", sysRole: "USER" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: REVOKE_MUTATION,
          variables: { input: { vcId: "vc-1" } },
        });

      const code = res.body.errors?.[0]?.code ?? res.body.errors?.[0]?.extensions?.code;
      expect(code).toBe("FORBIDDEN");
      expect(mockVcIssuanceUseCase.revokeUserVc).not.toHaveBeenCalled();
    });

    it("rejects unauthenticated callers with FORBIDDEN", async () => {
      const app = await createApolloTestServer({ issuer });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: REVOKE_MUTATION,
          variables: { input: { vcId: "vc-1" } },
        });

      const code = res.body.errors?.[0]?.code ?? res.body.errors?.[0]?.extensions?.code;
      expect(code).toBe("FORBIDDEN");
      expect(mockVcIssuanceUseCase.revokeUserVc).not.toHaveBeenCalled();
    });
  });

  describe("not-found / idempotency", () => {
    it("surfaces NOT_FOUND when the vcId does not exist", async () => {
      mockVcIssuanceUseCase.revokeUserVc.mockRejectedValueOnce(
        new NotFoundError("VcIssuance", { id: "missing" }),
      );

      const app = await createApolloTestServer({
        isAdmin: true,
        currentUser: { id: "admin-1", sysRole: "SYS_ADMIN" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: REVOKE_MUTATION,
          variables: { input: { vcId: "missing" } },
        });

      expect(res.body.errors).toBeDefined();
      const code = res.body.errors?.[0]?.code ?? res.body.errors?.[0]?.extensions?.code;
      expect(code).toBe("NOT_FOUND");
    });

    it("re-revoking an already-revoked VC returns the same snapshot (idempotent)", async () => {
      // The usecase enforces idempotency by returning the original
      // snapshot without re-invoking the StatusList. We mirror that
      // by returning `baseRevokedVc` from a single mock call: the
      // resolver should pass the response through unchanged.
      mockVcIssuanceUseCase.revokeUserVc.mockResolvedValueOnce(baseRevokedVc);

      const app = await createApolloTestServer({
        isAdmin: true,
        currentUser: { id: "admin-1", sysRole: "SYS_ADMIN" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: REVOKE_MUTATION,
          variables: { input: { vcId: "vc-1" } },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.revokeUserVc.id).toBe("vc-1");
      expect(res.body.data.revokeUserVc.revokedAt).toBeTruthy();
    });
  });

  describe("input wiring", () => {
    it("forwards the optional `reason` to the usecase verbatim", async () => {
      mockVcIssuanceUseCase.revokeUserVc.mockResolvedValueOnce(baseRevokedVc);

      const app = await createApolloTestServer({
        isAdmin: true,
        currentUser: { id: "admin-1", sysRole: "SYS_ADMIN" },
        issuer,
      });
      await request(app)
        .post("/graphql")
        .send({
          query: REVOKE_MUTATION,
          variables: {
            input: { vcId: "vc-1", reason: "policy violation" },
          },
        });

      expect(mockVcIssuanceUseCase.revokeUserVc).toHaveBeenCalledWith(
        expect.anything(),
        { vcId: "vc-1", reason: "policy violation" },
      );
    });

    it("works without a `reason` (optional field omitted)", async () => {
      mockVcIssuanceUseCase.revokeUserVc.mockResolvedValueOnce(baseRevokedVc);

      const app = await createApolloTestServer({
        isAdmin: true,
        currentUser: { id: "admin-1", sysRole: "SYS_ADMIN" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: REVOKE_MUTATION,
          variables: { input: { vcId: "vc-1" } },
        });

      expect(res.body.errors).toBeUndefined();
      expect(mockVcIssuanceUseCase.revokeUserVc).toHaveBeenCalledWith(
        expect.anything(),
        { vcId: "vc-1" },
      );
    });
  });
});
