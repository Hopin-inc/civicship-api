/**
 * UserDid GraphQL integration tests (§5.2.1 / Phase 1 step 8).
 *
 * Strategy A repositories are stubs (the Prisma model lands later), so
 * these tests cover the full Apollo + AuthZ + Resolver path with the
 * usecase mocked via tsyringe. They are the same shape as
 * `__tests__/auth/mutation.onlySelf.test.ts` so Phase 1 step 8 wires
 * cleanly into the existing auth coverage matrix.
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
  userDid: /* GraphQL */ `
    query ($userId: ID!) {
      userDid(userId: $userId) {
        id
        did
        operation
        documentHash
        network
        status
      }
    }
  `,
  createUserDid: /* GraphQL */ `
    mutation ($input: CreateUserDidInput!, $permission: CheckIsSelfPermissionInput!) {
      createUserDid(input: $input, permission: $permission) {
        id
        did
        operation
        status
      }
    }
  `,
  deactivateUserDid: /* GraphQL */ `
    mutation ($userId: ID!, $permission: CheckIsSelfPermissionInput!) {
      deactivateUserDid(userId: $userId, permission: $permission) {
        id
        did
        operation
        status
      }
    }
  `,
};

const fakeAnchor = {
  __typename: "UserDidAnchor" as const,
  id: "anchor-1",
  did: "did:web:api.civicship.app:users:user-1",
  operation: "CREATE",
  documentHash: "0".repeat(64),
  network: "CARDANO_MAINNET",
  chainTxHash: null,
  chainOpIndex: null,
  status: "PENDING",
  confirmedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

let issuer: PrismaClientIssuer;

const mockUserDidUseCase = {
  viewUserDid: jest.fn(),
  createUserDidForUser: jest.fn(),
  deactivateUserDidForUser: jest.fn(),
};

describe("UserDid GraphQL", () => {
  beforeAll(() => {
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    container.register("UserDidUseCase", { useValue: mockUserDidUseCase });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Query userDid", () => {
    it("returns the anchor view when the usecase resolves a row", async () => {
      mockUserDidUseCase.viewUserDid.mockResolvedValueOnce({
        ...fakeAnchor,
        operation: "CREATE",
        status: "PENDING",
      });

      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({ query: queries.userDid, variables: { userId: "user-1" } });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.userDid).toMatchObject({
        id: "anchor-1",
        did: "did:web:api.civicship.app:users:user-1",
        operation: "CREATE",
        status: "PENDING",
      });
      expect(mockUserDidUseCase.viewUserDid).toHaveBeenCalledTimes(1);
    });

    it("returns null when no anchor exists", async () => {
      mockUserDidUseCase.viewUserDid.mockResolvedValueOnce(null);

      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({ query: queries.userDid, variables: { userId: "user-1" } });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.userDid).toBeNull();
    });

    it("rejects unauthenticated requests with FORBIDDEN", async () => {
      const app = await createApolloTestServer({ issuer });
      const res = await request(app)
        .post("/graphql")
        .send({ query: queries.userDid, variables: { userId: "user-1" } });

      const code = res.body.errors?.[0]?.code ?? res.body.errors?.[0]?.extensions?.code;
      expect(code).toBe("FORBIDDEN");
      expect(mockUserDidUseCase.viewUserDid).not.toHaveBeenCalled();
    });
  });

  describe("Mutation createUserDid (IsSelf)", () => {
    it("invokes the usecase when the caller acts on their own userId", async () => {
      mockUserDidUseCase.createUserDidForUser.mockResolvedValueOnce({
        ...fakeAnchor,
        operation: "CREATE",
        status: "PENDING",
      });

      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: queries.createUserDid,
          variables: {
            input: { userId: "user-1", network: "CARDANO_PREPROD" },
            permission: { userId: "user-1" },
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.createUserDid.id).toBe("anchor-1");
      expect(mockUserDidUseCase.createUserDidForUser).toHaveBeenCalledWith(
        expect.anything(),
        "user-1",
        "CARDANO_PREPROD",
      );
    });

    it("rejects when permission.userId differs from currentUser.id", async () => {
      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: queries.createUserDid,
          variables: {
            input: { userId: "user-2" },
            permission: { userId: "user-2" },
          },
        });

      const code = res.body.errors?.[0]?.code ?? res.body.errors?.[0]?.extensions?.code;
      expect(code).toBe("FORBIDDEN");
      expect(mockUserDidUseCase.createUserDidForUser).not.toHaveBeenCalled();
    });
  });

  describe("Mutation deactivateUserDid (IsSelf)", () => {
    it("invokes the usecase for the caller's own DID", async () => {
      mockUserDidUseCase.deactivateUserDidForUser.mockResolvedValueOnce({
        ...fakeAnchor,
        operation: "DEACTIVATE",
        status: "PENDING",
      });

      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: queries.deactivateUserDid,
          variables: {
            userId: "user-1",
            permission: { userId: "user-1" },
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.deactivateUserDid.operation).toBe("DEACTIVATE");
      expect(mockUserDidUseCase.deactivateUserDidForUser).toHaveBeenCalledWith(
        expect.anything(),
        "user-1",
      );
    });

    it("rejects when targeting a different user", async () => {
      const app = await createApolloTestServer({
        currentUser: { id: "user-1" },
        issuer,
      });
      const res = await request(app)
        .post("/graphql")
        .send({
          query: queries.deactivateUserDid,
          variables: {
            userId: "user-2",
            permission: { userId: "user-2" },
          },
        });

      const code = res.body.errors?.[0]?.code ?? res.body.errors?.[0]?.extensions?.code;
      expect(code).toBe("FORBIDDEN");
      expect(mockUserDidUseCase.deactivateUserDidForUser).not.toHaveBeenCalled();
    });
  });
});
