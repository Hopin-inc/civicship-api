/**
 * Shared mock-factory helpers for Apollo / GraphQL integration tests.
 *
 * The integration tests under `__tests__/integration/userDid/`,
 * `__tests__/integration/vcIssuance/`, and `__tests__/auth/` all need
 * the same three `jest.mock(...)` calls at the top of the file:
 *
 *   1. stub out `@/presentation/graphql/scalar` (custom scalar bundle
 *      that pulls in heavy deps unrelated to AuthZ + resolver wiring)
 *   2. redirect `@/presentation/graphql/schema/esmPath#getESMDirname`
 *      to a CJS-friendly path (ESM `import.meta.url` is unavailable in
 *      ts-jest's CJS output, so we resolve from the test file's location)
 *   3. stub `@/application/domain/utils#getCurrentUserId` to a fixed id
 *
 * `jest.mock` factories must run synchronously at hoist time, so we
 * cannot extract the *registration* of the mocks into a shared function.
 * What we *can* extract is the **factory bodies**, which keeps the
 * per-file boilerplate down to a single thin call per mock and
 * eliminates the duplicate object literals SonarCloud's token-based
 * duplicate detector flagged.
 *
 * Usage (in each test file):
 *
 * ```ts
 * import {
 *   scalarMockFactory,
 *   esmPathMockFactory,
 *   currentUserMockFactory,
 * } from "@/__tests__/helper/graphql-test-mocks";
 *
 * jest.mock("@/presentation/graphql/scalar", scalarMockFactory);
 * jest.mock("@/presentation/graphql/schema/esmPath", () =>
 *   esmPathMockFactory(__dirname),
 * );
 * jest.mock("@/application/domain/utils", () => currentUserMockFactory("user-1"));
 * ```
 *
 * `__dirname` differs per test file, so `esmPathMockFactory` takes it
 * as an argument and resolves the schema directory at call time.
 */

import path from "path";

/**
 * Factory for `jest.mock("@/presentation/graphql/scalar", ...)`. The
 * default export is replaced by an empty object — the AuthZ + resolver
 * wiring tests never invoke a scalar serializer, so we avoid loading
 * the real scalar bundle (which transitively imports modules outside
 * the GraphQL boundary).
 */
export function scalarMockFactory() {
  return {
    __esModule: true,
    default: {},
  };
}

/**
 * Factory for `jest.mock("@/presentation/graphql/schema/esmPath", ...)`.
 * The real `getESMDirname` reads `import.meta.url`, which is undefined
 * under ts-jest's CJS transform. The mock resolves the schema directory
 * relative to the *calling test file* (`testDirname` is `__dirname`
 * passed in from the test).
 */
export function esmPathMockFactory(testDirname: string) {
  return {
    getESMDirname: jest.fn(() =>
      path.resolve(testDirname, "../../../../src/presentation/graphql/schema"),
    ),
  };
}

/**
 * Factory for `jest.mock("@/application/domain/utils", ...)`. Only
 * `getCurrentUserId` is needed by the resolver path under test, so the
 * other utils stay un-stubbed (jest.mock with a factory replaces the
 * whole module — passing only the field we need is sufficient because
 * unused exports don't get accessed).
 */
export function currentUserMockFactory(userId: string) {
  return {
    getCurrentUserId: jest.fn(() => userId),
  };
}
