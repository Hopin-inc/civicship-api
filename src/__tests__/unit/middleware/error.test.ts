import errorMiddleware from "@/presentation/middleware/error";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/errors/graphql";
import { GraphQLError } from "graphql";
import logger from "@/infrastructure/logging";
import type { IContext } from "@/types/server";
import type { GraphQLResolveInfo } from "graphql";

jest.mock("@/infrastructure/logging", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const dummyContext = {} as IContext;
const dummyInfo = {} as GraphQLResolveInfo;

const invoke = (resolver: () => unknown) =>
  errorMiddleware(
    resolver as Parameters<typeof errorMiddleware>[0],
    undefined,
    undefined,
    dummyContext,
    dummyInfo,
  );

describe("errorMiddleware", () => {
  beforeEach(() => {
    (logger.error as jest.Mock).mockClear();
  });

  it("passes through GraphQLError-derived errors without logging", async () => {
    const original = new NotFoundError("Community", { id: "system" });

    await expect(invoke(() => Promise.reject(original))).rejects.toBe(original);

    // formatError 側 (graphql/server.ts) に一元化したのでここでは出さない
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("preserves AuthorizationError code (FORBIDDEN) and does not log", async () => {
    const original = new AuthorizationError("nope");

    const promise = invoke(() => Promise.reject(original));
    await expect(promise).rejects.toBe(original);
    await expect(promise).rejects.toMatchObject({
      extensions: { code: "FORBIDDEN" },
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("preserves ValidationError code and does not log", async () => {
    const original = new ValidationError("bad input", ["field"]);

    const promise = invoke(() => Promise.reject(original));
    await expect(promise).rejects.toBe(original);
    await expect(promise).rejects.toMatchObject({
      extensions: { code: "VALIDATION_ERROR" },
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("passes through plain GraphQLError (non-ApolloError) unchanged", async () => {
    const original = new GraphQLError("syntax-ish", {
      extensions: { code: "BAD_USER_INPUT" },
    });

    await expect(invoke(() => Promise.reject(original))).rejects.toBe(original);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("wraps non-GraphQLError as INTERNAL_SERVER_ERROR and logs ERROR", async () => {
    const raw = new TypeError("unexpected");

    const promise = invoke(() => Promise.reject(raw));
    await expect(promise).rejects.toBeInstanceOf(GraphQLError);
    await expect(promise).rejects.toMatchObject({
      message: "Internal Server Error",
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith("Unhandled resolver error", raw);
  });

  it("returns the resolver result on success", async () => {
    const result = await invoke(() => Promise.resolve({ ok: true }));
    expect(result).toEqual({ ok: true });
    expect(logger.error).not.toHaveBeenCalled();
  });
});
