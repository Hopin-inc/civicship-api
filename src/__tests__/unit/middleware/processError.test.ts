import { GraphQLError } from "graphql";
import { UnauthorizedError } from "@graphql-authz/core";
import { processAuthzError } from "@/presentation/graphql/processAuthzError";
import {
  AuthorizationError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@/errors/graphql";

describe("processAuthzError (production)", () => {
  it("passes through AuthorizationError unchanged (FORBIDDEN preserved)", () => {
    const original = new AuthorizationError("User must be admin");
    expect(() => processAuthzError(original, /* isProd */ true)).toThrow(original);
    try {
      processAuthzError(original, true);
    } catch (e) {
      expect(e).toBe(original);
      expect((e as AuthorizationError).extensions.code).toBe("FORBIDDEN");
    }
  });

  it("passes through AuthenticationError unchanged (UNAUTHENTICATED preserved)", () => {
    const original = new AuthenticationError("not logged in");
    try {
      processAuthzError(original, true);
    } catch (e) {
      expect(e).toBe(original);
      expect((e as AuthenticationError).extensions.code).toBe("UNAUTHENTICATED");
    }
  });

  it("passes through NotFoundError unchanged (NOT_FOUND preserved)", () => {
    const original = new NotFoundError("Community", { id: "system" });
    try {
      processAuthzError(original, true);
    } catch (e) {
      expect(e).toBe(original);
      expect((e as NotFoundError).extensions.code).toBe("NOT_FOUND");
    }
  });

  it("passes through ValidationError unchanged (VALIDATION_ERROR preserved)", () => {
    const original = new ValidationError("bad", ["field"]);
    try {
      processAuthzError(original, true);
    } catch (e) {
      expect(e).toBe(original);
      expect((e as ValidationError).extensions.code).toBe("VALIDATION_ERROR");
    }
  });

  it("converts UnauthorizedError (graphql-authz wrapper) to GraphQLError with FORBIDDEN", () => {
    // graphql-authz の preExecRule は `{ error: new AuthorizationError(...) }`
    // を渡しても prepareError() で UnauthorizedError にラップしてしまうので、
    // ルール失敗時は実質ここに着地する。デフォルト processError と同じ挙動を
    // 保つことで __tests__/auth/ の "FORBIDDEN" 期待が満たされる。
    const wrapped = new UnauthorizedError("User must be admin");
    try {
      processAuthzError(wrapped, true);
    } catch (e) {
      expect(e).toBeInstanceOf(GraphQLError);
      expect((e as GraphQLError).message).toBe("User must be admin");
      expect((e as GraphQLError).extensions.code).toBe("FORBIDDEN");
    }
  });

  it("passes through plain GraphQLError unchanged", () => {
    const original = new GraphQLError("boom", {
      extensions: { code: "CUSTOM_CODE" },
    });
    try {
      processAuthzError(original, true);
    } catch (e) {
      expect(e).toBe(original);
    }
  });

  it("wraps non-GraphQLError as Internal Server Error in production", () => {
    const raw = new TypeError("unexpected");
    try {
      processAuthzError(raw, true);
    } catch (e) {
      expect(e).not.toBe(raw);
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe("Internal Server Error");
    }
  });
});

describe("processAuthzError (non-production)", () => {
  it("re-throws GraphQLError派生 verbatim", () => {
    const apolloErr = new AuthorizationError("nope");
    expect(() => processAuthzError(apolloErr, /* isProd */ false)).toThrow(apolloErr);
  });

  it("still converts UnauthorizedError to FORBIDDEN (matches default plugin behavior)", () => {
    // 非本番でも UnauthorizedError は authz テストで FORBIDDEN を期待される
    // ので、isProd 分岐の前に処理する。
    const wrapped = new UnauthorizedError("denied");
    try {
      processAuthzError(wrapped, false);
    } catch (e) {
      expect(e).toBeInstanceOf(GraphQLError);
      expect((e as GraphQLError).extensions.code).toBe("FORBIDDEN");
    }
  });

  it("re-throws raw non-GraphQL errors verbatim (no Internal Server Error wrap)", () => {
    const rawErr = new TypeError("unexpected");
    expect(() => processAuthzError(rawErr, false)).toThrow(rawErr);
  });
});
