import { GraphQLError } from "graphql";
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
  it("re-throws the original error verbatim for any error type", () => {
    const apolloErr = new AuthorizationError("nope");
    const rawErr = new TypeError("unexpected");

    expect(() => processAuthzError(apolloErr, /* isProd */ false)).toThrow(apolloErr);
    expect(() => processAuthzError(rawErr, false)).toThrow(rawErr);
  });
});
