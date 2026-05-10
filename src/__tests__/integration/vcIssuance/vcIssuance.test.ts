/**
 * VcIssuance GraphQL integration tests (§5.2.2 / Phase 1 step 8).
 *
 * Strategy A repository is a stub (the Prisma model lands later), so
 * these tests cover the full Apollo + AuthZ + Resolver path with the
 * usecase mocked via tsyringe.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { createApolloTestServer } from "@/__tests__/helper/test-server";
import request from "supertest";
import path from "path";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

jest.mock("@/presentation/graphql/scalar", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/presentation/graphql/schema/esmPath", () => ({
  getESMDirname: jest.fn(() => path.resolve(__dirname, "../../../../src/presentation/graphql/schema")),
}));

jest.mock("@/application/domain/utils", () => ({
  getCurrentUserId: jest.fn(() => "user-1"),
}));

const queries = {
  vcIssuance: /* GraphQL */ `
    query ($id: ID!) {
      vcIssuance(id: $id) {
        id
        userId
        issuerDid
        subjectDid
        vcFormat
        status
        vcJwt
      }
    }
  `,
  vcIssuancesByUser: /* GraphQL */ `
    query ($userId: ID!) {
      vcIssuancesByUser(userId: $userId) {
        id
        status
      }
    }
  `,
  issueVc: /* GraphQL */ `
    mutation ($input: IssueVcInput!) {
      issueVc(input: $input) {
        id
        status
        vcFormat
      }
    }
  `,
};

const fakeVc = {
  __typename: "VcIssuance" as const,
  id: "vc-1",
  userId: "user-1",
  evaluationId: null,
  issuerDid: "did:web:api.civicship.app",
  subjectDid: "did:web:api.civicship.app:users:user-1",
  vcFormat: "INTERNAL_JWT",
  vcJwt: "h.p.s",
  status: "COMPLETED",
  statusListIndex: null,
  statusListCredential: null,
  revokedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

let issuer: PrismaClientIssuer;

const mockVcIssuanceUseCase = {
  viewVcIssuance: jest.fn(),
  viewVcIssuancesByUser: jest.fn(),
  issueVc: jest.fn(),
};

describe("VcIssuance GraphQL", () => {
  beforeAll(() => {
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    container.register("VcIssuanceUseCase", { useValue: mockVcIssuanceUseCase });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Query vcIssuance (IsUser)", () => {
    it("returns the VC when the usecase resolves a row", async () => {
      mockVcIssuanceUseCase.viewVcIssuance.mockResolvedValueOnce(fakeVc);

      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({ query: queries.vcIssuance, variables: { id: "vc-1" } });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.vcIssuance).toMatchObject({
        id: "vc-1",
        vcFormat: "INTERNAL_JWT",
        status: "COMPLETED",
      });
      expect(mockVcIssuanceUseCase.viewVcIssuance).toHaveBeenCalledTimes(1);
    });

    it("returns null when no VC exists", async () => {
      mockVcIssuanceUseCase.viewVcIssuance.mockResolvedValueOnce(null);

      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({ query: queries.vcIssuance, variables: { id: "missing" } });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.vcIssuance).toBeNull();
    });

    it("rejects unauthenticated callers", async () => {
      const app = await createApolloTestServer({ issuer });
      const res = await request(app)
        .post("/graphql")
        .send({ query: queries.vcIssuance, variables: { id: "vc-1" } });

      const code = res.body.errors?.[0]?.code ?? res.body.errors?.[0]?.extensions?.code;
      expect(code).toBe("FORBIDDEN");
      expect(mockVcIssuanceUseCase.viewVcIssuance).not.toHaveBeenCalled();
    });
  });

  describe("Query vcIssuancesByUser (IsUser)", () => {
    it("returns the list when the usecase resolves rows", async () => {
      mockVcIssuanceUseCase.viewVcIssuancesByUser.mockResolvedValueOnce([fakeVc]);

      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({ query: queries.vcIssuancesByUser, variables: { userId: "user-1" } });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.vcIssuancesByUser).toHaveLength(1);
      expect(res.body.data.vcIssuancesByUser[0].id).toBe("vc-1");
    });

    it("returns an empty array when no VCs exist", async () => {
      mockVcIssuanceUseCase.viewVcIssuancesByUser.mockResolvedValueOnce([]);

      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({ query: queries.vcIssuancesByUser, variables: { userId: "user-1" } });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.vcIssuancesByUser).toEqual([]);
    });
  });

  describe("Mutation issueVc (IsAdmin)", () => {
    it("invokes the usecase when the caller is admin", async () => {
      mockVcIssuanceUseCase.issueVc.mockResolvedValueOnce(fakeVc);

      const app = await createApolloTestServer({
        isAdmin: true,
        currentUser: { id: "admin-1", sysRole: "SYS_ADMIN" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: queries.issueVc,
          variables: {
            input: {
              userId: "user-1",
              subjectDid: "did:web:api.civicship.app:users:user-1",
              claims: { type: "EvaluationCredential" },
            },
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.issueVc.id).toBe("vc-1");
      expect(mockVcIssuanceUseCase.issueVc).toHaveBeenCalledTimes(1);
    });

    it("rejects when the caller is not admin", async () => {
      const app = await createApolloTestServer({
        currentUser: { id: "user-1", sysRole: "USER" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: queries.issueVc,
          variables: {
            input: {
              userId: "user-1",
              subjectDid: "did:web:api.civicship.app:users:user-1",
              claims: {},
            },
          },
        });

      const code = res.body.errors?.[0]?.code ?? res.body.errors?.[0]?.extensions?.code;
      expect(code).toBe("FORBIDDEN");
      expect(mockVcIssuanceUseCase.issueVc).not.toHaveBeenCalled();
    });
  });
});
