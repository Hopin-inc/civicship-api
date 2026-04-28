import { GraphQLError } from "graphql";
import { UnauthorizedError } from "@graphql-authz/core";
import { processAuthzError } from "@/presentation/graphql/processAuthzError";
import {
  AuthorizationError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@/errors/graphql";
import logger from "@/infrastructure/logging";

jest.mock("@/infrastructure/logging", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("processAuthzError (production)", () => {
  beforeEach(() => {
    (logger.error as jest.Mock).mockClear();
  });
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

  it("wraps non-GraphQLError as INTERNAL_SERVER_ERROR GraphQLError and logs the original", () => {
    const raw = new TypeError("unexpected");
    try {
      processAuthzError(raw, true);
    } catch (e) {
      expect(e).not.toBe(raw);
      expect(e).toBeInstanceOf(GraphQLError);
      expect((e as GraphQLError).message).toBe("Internal Server Error");
      expect((e as GraphQLError).extensions.code).toBe("INTERNAL_SERVER_ERROR");
    }

    // 原型 (TypeError) を ERROR severity で残しているか
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith("Unhandled authz plugin error", raw);
  });

  it("does not log when error is a GraphQLError (formatError handles it)", () => {
    expect(() => processAuthzError(new AuthorizationError("nope"), true)).toThrow();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("does not log when error is an UnauthorizedError (rule rejection, expected)", () => {
    expect(() => processAuthzError(new UnauthorizedError("denied"), true)).toThrow();
    expect(logger.error).not.toHaveBeenCalled();
  });
});

describe("processAuthzError (non-production)", () => {
  beforeEach(() => {
    (logger.error as jest.Mock).mockClear();
  });

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

  it("re-throws raw non-GraphQL errors verbatim (no Internal Server Error wrap, no logging)", () => {
    const rawErr = new TypeError("unexpected");
    expect(() => processAuthzError(rawErr, false)).toThrow(rawErr);
    // 非本番では原型 throw のみ、ログも出さない (開発者がスタックを直接見る)
    expect(logger.error).not.toHaveBeenCalled();
  });
});
