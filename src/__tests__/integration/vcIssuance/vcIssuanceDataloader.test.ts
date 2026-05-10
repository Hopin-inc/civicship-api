/**
 * VcIssuance field-resolver / DataLoader integration test (Phase 1.5).
 *
 * Validates that:
 *   1. `VcIssuance.user` is resolved via the **shared** per-request
 *      DataLoader `ctx.loaders.user` (the same loader used by every
 *      other `userId → GqlUser` field resolver in the codebase).
 *   2. `VcIssuance.evaluation` is resolved via `ctx.loaders.evaluation`
 *      when `evaluationId` is set, and short-circuits to `null` when it
 *      is `null`.
 *   3. **N+1 prevention** — querying 10 VcIssuance rows under
 *      `vcIssuancesByUser` triggers exactly **one** call to the user
 *      loader's batch fn (which batches all 10 user ids into a single
 *      fetch).
 *
 * Sharing `ctx.loaders.user` / `ctx.loaders.evaluation` (instead of
 * dedicated `userByVcIssuance` / `evaluationByVcIssuance` factories) is
 * the post-PR-#1113 design — it lets DataLoader coalesce same-tick
 * `.load()` calls across multiple field resolvers into a single batch
 * and removes the duplicated `prisma.user.findMany(...)` /
 * `prisma.evaluation.findMany(...)` blocks flagged by SonarCloud.
 *
 * The usecase is mocked via tsyringe (Strategy A repository) so the
 * test isolates the resolver+loader wiring from any DB dependency.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import DataLoader from "dataloader";
import { registerProductionDependencies } from "@/application/provider";
import { createApolloTestServer } from "@/__tests__/helper/test-server";
import request from "supertest";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

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

const vcIssuanceWithUserQuery = /* GraphQL */ `
  query ($id: ID!) {
    vcIssuance(id: $id) {
      id
      userId
      evaluationId
      user {
        id
        name
      }
      evaluation {
        id
      }
    }
  }
`;

const vcIssuancesByUserWithUserQuery = /* GraphQL */ `
  query ($userId: ID!) {
    vcIssuancesByUser(userId: $userId) {
      id
      user {
        id
      }
    }
  }
`;

function makeFakeVc(overrides: Partial<{ id: string; userId: string; evaluationId: string | null }>) {
  return {
    __typename: "VcIssuance" as const,
    id: overrides.id ?? "vc-1",
    userId: overrides.userId ?? "user-1",
    evaluationId: overrides.evaluationId ?? null,
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
}

let issuer: PrismaClientIssuer;

const mockVcIssuanceUseCase = {
  viewVcIssuance: jest.fn(),
  viewVcIssuancesByUser: jest.fn(),
  issueVc: jest.fn(),
};

describe("VcIssuance field resolvers (shared loaders)", () => {
  beforeAll(() => {
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    container.register("VcIssuanceUseCase", { useValue: mockVcIssuanceUseCase });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves VcIssuance.user via ctx.loaders.user", async () => {
    mockVcIssuanceUseCase.viewVcIssuance.mockResolvedValueOnce(
      makeFakeVc({ id: "vc-1", userId: "user-1" }),
    );

    const userLoad = jest.fn().mockResolvedValue({ id: "user-1", name: "Test User" });
    const evaluationLoad = jest.fn().mockResolvedValue(null);

    const app = await createApolloTestServer({
      currentUser: { id: "user-1" },
      issuer,
      loaders: {
        user: { load: userLoad },
        evaluation: { load: evaluationLoad },
      },
    });

    const res = await request(app)
      .post("/graphql")
      .send({ query: vcIssuanceWithUserQuery, variables: { id: "vc-1" } });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.vcIssuance).toMatchObject({
      id: "vc-1",
      user: { id: "user-1", name: "Test User" },
      evaluation: null,
    });
    expect(userLoad).toHaveBeenCalledTimes(1);
    expect(userLoad).toHaveBeenCalledWith("user-1");
    // evaluationId is null so the loader must not be hit.
    expect(evaluationLoad).not.toHaveBeenCalled();
  });

  it("resolves VcIssuance.evaluation via ctx.loaders.evaluation when evaluationId is set", async () => {
    mockVcIssuanceUseCase.viewVcIssuance.mockResolvedValueOnce(
      makeFakeVc({ id: "vc-1", userId: "user-1", evaluationId: "eval-1" }),
    );

    const userLoad = jest.fn().mockResolvedValue({ id: "user-1", name: "Test User" });
    const evaluationLoad = jest.fn().mockResolvedValue({ id: "eval-1" });

    const app = await createApolloTestServer({
      currentUser: { id: "user-1" },
      issuer,
      loaders: {
        user: { load: userLoad },
        evaluation: { load: evaluationLoad },
      },
    });

    const res = await request(app)
      .post("/graphql")
      .send({ query: vcIssuanceWithUserQuery, variables: { id: "vc-1" } });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.vcIssuance).toMatchObject({
      id: "vc-1",
      user: { id: "user-1" },
      evaluation: { id: "eval-1" },
    });
    expect(evaluationLoad).toHaveBeenCalledTimes(1);
    expect(evaluationLoad).toHaveBeenCalledWith("eval-1");
  });

  it("returns null for VcIssuance.user when the user has been deleted", async () => {
    // schema が `user: User` (nullable) になっているので、loader が null を
    // 返した場合 GraphQL 側で例外を投げず、そのまま `null` が伝搬する。
    mockVcIssuanceUseCase.viewVcIssuance.mockResolvedValueOnce(
      makeFakeVc({ id: "vc-1", userId: "user-1" }),
    );

    const userLoad = jest.fn().mockResolvedValue(null);
    const evaluationLoad = jest.fn().mockResolvedValue(null);

    const app = await createApolloTestServer({
      currentUser: { id: "user-1" },
      issuer,
      loaders: {
        user: { load: userLoad },
        evaluation: { load: evaluationLoad },
      },
    });

    const res = await request(app)
      .post("/graphql")
      .send({ query: vcIssuanceWithUserQuery, variables: { id: "vc-1" } });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.vcIssuance).toMatchObject({
      id: "vc-1",
      user: null,
      evaluation: null,
    });
  });

  it("batches 10 user lookups into a single underlying fetch (N+1 prevention)", async () => {
    // 10 distinct VC rows, each pointing to its own user. The expectation
    // is that a real DataLoader collapses the 10 `.load()` calls from the
    // field resolvers into ONE batch fetch.
    const rows = Array.from({ length: 10 }, (_, i) =>
      makeFakeVc({ id: `vc-${i}`, userId: `user-${i}` }),
    );
    mockVcIssuanceUseCase.viewVcIssuancesByUser.mockResolvedValueOnce(rows);

    // Real DataLoader instance — its batch fn is the spy. If batching is
    // working, the batch fn should be invoked exactly once with all 10
    // ids (DataLoader coalesces same-tick `.load` calls).
    const userBatch = jest.fn(async (ids: readonly string[]) =>
      ids.map((id) => ({ id, name: `User ${id}` })),
    );
    const userLoader = new DataLoader<string, { id: string; name: string }>(userBatch);

    const app = await createApolloTestServer({
      currentUser: { id: "user-1" },
      issuer,
      loaders: {
        user: userLoader,
        evaluation: { load: jest.fn() },
      },
    });

    const res = await request(app)
      .post("/graphql")
      .send({ query: vcIssuancesByUserWithUserQuery, variables: { userId: "user-1" } });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.vcIssuancesByUser).toHaveLength(10);
    // The headline N+1 assertion: one batch call covers all 10 ids.
    expect(userBatch).toHaveBeenCalledTimes(1);
    const calledIds = userBatch.mock.calls[0][0];
    expect([...calledIds]).toEqual(rows.map((r) => r.userId));
  });
});
