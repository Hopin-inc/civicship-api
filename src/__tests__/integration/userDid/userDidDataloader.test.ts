/**
 * UserDidAnchor field-resolver / DataLoader integration test (Phase 1.5).
 *
 * Validates that:
 *   1. `UserDidAnchor.user` is resolved via the **shared** per-request
 *      DataLoader `ctx.loaders.user` — i.e. the same loader used by every
 *      other `userId → GqlUser` field resolver in the codebase.
 *   2. The loader is invoked with `parent.userId` (carried by
 *      `UserDidPresenter.view`), confirming the foreign key forwards
 *      cleanly through the resolver result without an extra DB read.
 *
 * Sharing `ctx.loaders.user` (instead of a `userByUserDidAnchor` factory)
 * is the post-PR-#1113 design — it lets DataLoader coalesce same-tick
 * `.load()` calls across `Article.author`, `UserDidAnchor.user`,
 * `VcIssuance.user`, etc. into a single batch and removes a duplicated
 * `prisma.user.findMany(...)` block flagged by SonarCloud.
 *
 * Boilerplate (jest.mock factories, container wiring, supertest POST) is
 * sourced from `@/__tests__/helper/graphql-test-mocks` to keep the
 * per-suite footprint focused on the assertions under test.
 */

import "reflect-metadata";

// Mock factories are required from inside `jest.mock` callbacks because
// Jest hoists `jest.mock` calls above ES `import`s — outer-scope symbols
// (other than ones prefixed with `mock`) are not yet initialized when
// the factory runs. `require()` resolves lazily so this is safe.
jest.mock("@/presentation/graphql/scalar", () =>
  jest.requireActual("@/__tests__/helper/graphql-test-mocks").scalarMockFactory(),
);
jest.mock("@/presentation/graphql/schema/esmPath", () =>
  jest.requireActual("@/__tests__/helper/graphql-test-mocks").esmPathMockFactory(__dirname),
);
jest.mock("@/application/domain/utils", () =>
  jest.requireActual("@/__tests__/helper/graphql-test-mocks").currentUserMockFactory("user-1"),
);

import {
  runGqlQuery,
  setupResolverIntegrationTest,
} from "@/__tests__/helper/graphql-test-mocks";

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

const mockUserDidUseCase = {
  viewUserDid: jest.fn(),
  createUserDidForUser: jest.fn(),
  deactivateUserDidForUser: jest.fn(),
};

describe("UserDidAnchor.user (shared ctx.loaders.user)", () => {
  const { getIssuer } = setupResolverIntegrationTest("UserDidUseCase", mockUserDidUseCase);

  it("resolves UserDidAnchor.user via ctx.loaders.user", async () => {
    mockUserDidUseCase.viewUserDid.mockResolvedValueOnce(fakeAnchor);

    const userLoad = jest.fn().mockResolvedValue({
      id: "user-1",
      name: "Test User",
    });

    const res = await runGqlQuery({
      issuer: getIssuer(),
      loaders: { user: { load: userLoad } },
      query: userDidWithUserQuery,
      variables: { userId: "user-1" },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.userDid).toMatchObject({
      id: "anchor-1",
      user: { id: "user-1", name: "Test User" },
    });
    expect(userLoad).toHaveBeenCalledTimes(1);
    expect(userLoad).toHaveBeenCalledWith("user-1");
  });

  it("returns null for UserDidAnchor.user when the user has been deleted", async () => {
    // schema が `user: User` (nullable) になっているので、loader が null を
    // 返した場合 GraphQL 側で例外を投げず、そのまま `null` が伝搬する。
    mockUserDidUseCase.viewUserDid.mockResolvedValueOnce(fakeAnchor);

    const userLoad = jest.fn().mockResolvedValue(null);

    const res = await runGqlQuery({
      issuer: getIssuer(),
      loaders: { user: { load: userLoad } },
      query: userDidWithUserQuery,
      variables: { userId: "user-1" },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.userDid).toMatchObject({
      id: "anchor-1",
      user: null,
    });
  });
});
