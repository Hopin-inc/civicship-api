/**
 * UserDidAnchor field-resolver / DataLoader integration test (Phase 1.5).
 *
 * Validates that:
 *   1. `UserDidAnchor.user` is resolved via the per-request DataLoader
 *      registered as `ctx.loaders.userByUserDidAnchor`.
 *   2. The loader is invoked with `parent.userId` (carried by
 *      `UserDidPresenter.view`), confirming the foreign key forwards
 *      cleanly through the resolver result without an extra DB read.
 *
 * The usecase is mocked via tsyringe (Strategy A repository) so the
 * test isolates the resolver+loader wiring from any DB dependency.
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
  getESMDirname: jest.fn(() =>
    path.resolve(__dirname, "../../../../src/presentation/graphql/schema"),
  ),
}));

jest.mock("@/application/domain/utils", () => ({
  getCurrentUserId: jest.fn(() => "user-1"),
}));

const userDidWithUserQuery = /* GraphQL */ `
  query ($userId: ID!) {
    userDid(userId: $userId) {
      id
      did
      user {
        id
        name
      }
    }
  }
`;

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
  // Carried onto the resolver result by `UserDidPresenter.view` so the
  // field resolver can read `parent.userId`.
  userId: "user-1",
};

let issuer: PrismaClientIssuer;

const mockUserDidUseCase = {
  viewUserDid: jest.fn(),
  createUserDidForUser: jest.fn(),
  deactivateUserDidForUser: jest.fn(),
};

describe("UserDidAnchor.user (DataLoader)", () => {
  beforeAll(() => {
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    container.register("UserDidUseCase", { useValue: mockUserDidUseCase });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves UserDidAnchor.user via the userByUserDidAnchor loader", async () => {
    mockUserDidUseCase.viewUserDid.mockResolvedValueOnce(fakeAnchor);

    const userByUserDidAnchorLoad = jest.fn().mockResolvedValue({
      id: "user-1",
      name: "Test User",
    });

    const app = await createApolloTestServer({
      currentUser: { id: "user-1" },
      issuer,
      loaders: {
        userByUserDidAnchor: { load: userByUserDidAnchorLoad },
      },
    });

    const res = await request(app)
      .post("/graphql")
      .send({ query: userDidWithUserQuery, variables: { userId: "user-1" } });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.userDid).toMatchObject({
      id: "anchor-1",
      user: { id: "user-1", name: "Test User" },
    });
    expect(userByUserDidAnchorLoad).toHaveBeenCalledTimes(1);
    expect(userByUserDidAnchorLoad).toHaveBeenCalledWith("user-1");
  });
});
