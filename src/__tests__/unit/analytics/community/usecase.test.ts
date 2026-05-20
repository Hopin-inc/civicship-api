import "reflect-metadata";
import AnalyticsCommunityUseCase from "@/application/domain/analytics/community/usecase";
import { IContext } from "@/types/server";
import { AuthorizationError } from "@/errors/graphql";

describe("AnalyticsCommunityUseCase authz scoping", () => {
  // Service is never reached in these tests — the guard runs first and
  // throws before any service / repository code executes, so a no-op
  // double is sufficient.
  const service = {} as never;

  const baseInput = {
    communityId: "kibotcha",
    asOf: new Date("2026-04-01T00:00:00Z"),
  };

  it("rejects non-admin callers whose ctx.communityId differs from input.communityId", async () => {
    const usecase = new AnalyticsCommunityUseCase(service);
    const ctx = { communityId: "other-community" } as IContext;

    await expect(usecase.getCommunity({ input: baseInput }, ctx)).rejects.toThrow(
      AuthorizationError,
    );
    await expect(usecase.getCommunity({ input: baseInput }, ctx)).rejects.toThrow(
      /Community does not match the current scope/,
    );
  });

  it("rejects non-admin callers with a missing ctx.communityId (no header)", async () => {
    const usecase = new AnalyticsCommunityUseCase(service);
    const ctx = {} as IContext;

    await expect(usecase.getCommunity({ input: baseInput }, ctx)).rejects.toThrow(
      AuthorizationError,
    );
  });
});
