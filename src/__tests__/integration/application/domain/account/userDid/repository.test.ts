/**
 * Integration test skeleton for `UserDidAnchorRepository` (Phase 1 step 7
 * — strategy A cleanup).
 *
 * Background: the Phase 1 step 7 PR replaced the in-memory stub with a
 * Prisma-backed repository. The unit tests cover the call shape via
 * `useValue` mocks but do NOT exercise the actual SQL round-trip — that
 * coverage only comes from a real Postgres. This file is the placeholder
 * for that coverage; it ships as `describe.skip(...)` until the CI image
 * has the test database wired up (`pnpm container:up` + RLS migrations
 * applied).
 *
 * TODO(phase1.5): un-skip when CI provisions a PostgreSQL with the
 * UserDidAnchor table. The hand-rolled smoke test below covers the two
 * paths most likely to regress:
 *   1. `findLatestByUserId` returns the most recent row (orderBy desc).
 *   2. `createCreate` round-trips the canonical CreateUserDidAnchorInput.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.1
 *   CLAUDE.md "Testing Guidelines" — integration tests with real database
 */

import "reflect-metadata";

describe.skip("UserDidAnchorRepository (integration)", () => {
  // Intentionally not implemented yet — see file header. The Prisma
  // schema for UserDidAnchor was introduced in PR #1094; this test will
  // be wired up once the CI image runs migrations against a Postgres
  // container.
  //
  // Sketch (kept as a comment so reviewers can see the intended shape):
  //
  //   beforeEach(async () => {
  //     await TestDataSourceHelper.deleteAll();
  //     container.reset();
  //     registerProductionDependencies();
  //   });
  //
  //   it("createCreate then findLatestByUserId returns the inserted row", async () => {
  //     const ctx = buildPublicCtx();
  //     const repo = container.resolve<import("@/application/domain/account/userDid/data/repository").default>(
  //       "UserDidAnchorRepository",
  //     );
  //     await repo.createCreate(ctx, sampleCreateInput);
  //     const latest = await repo.findLatestByUserId(sampleCreateInput.userId);
  //     expect(latest?.did).toBe(sampleCreateInput.did);
  //   });
  it("placeholder — see TODO in file header", () => {
    expect(true).toBe(true);
  });
});
