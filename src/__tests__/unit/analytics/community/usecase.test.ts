import "reflect-metadata";
import AnalyticsCommunityUseCase from "@/application/domain/analytics/community/usecase";
import type AnalyticsCommunityService from "@/application/domain/analytics/community/service";
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

describe("AnalyticsCommunityUseCase lazy field resolution", () => {
  const asOf = new Date("2026-04-01T00:00:00Z");
  const baseInput = { communityId: "kibotcha", asOf };
  // SYS_ADMIN bypasses the input.communityId scope check, so a single
  // admin ctx exercises the happy path for every community id.
  const adminCtx = { isAdmin: true } as IContext;

  /**
   * Fresh jest-mock service double per test. Every DB-facing method the
   * usecase can reach is stubbed with a benign value so the field
   * resolvers run end-to-end (through the real aggregations + presenter)
   * over an empty member set without touching a database.
   */
  function buildService() {
    return {
      getCommunityById: jest
        .fn()
        .mockResolvedValue({ communityId: "kibotcha", communityName: "きぼっちゃ" }),
      getMemberStats: jest.fn().mockResolvedValue([]),
      getMonthlyActivity: jest.fn().mockResolvedValue([]),
      getAllTimeTotals: jest.fn().mockResolvedValue({
        totalDonationPoints: BigInt(0),
        maxChainDepth: 0,
        dataFrom: null,
        dataTo: null,
      }),
      getMonthActivityWithPrev: jest.fn().mockResolvedValue({
        currentRate: 0,
        currentSenderCount: 0,
        currentTotalMembers: 0,
        growthRateActivity: null,
      }),
      getRetentionTrend: jest.fn().mockResolvedValue([]),
      getCohortRetention: jest.fn().mockResolvedValue([]),
      getChainDepthDistribution: jest.fn().mockResolvedValue([{ depth: 1, count: 3 }]),
      getAlerts: jest
        .fn()
        .mockResolvedValue({ churnSpike: false, activeDrop: false, noNewMembers: false }),
      getWindowHubMemberCount: jest.fn().mockResolvedValue(2),
    };
  }

  function build() {
    const service = buildService();
    const usecase = new AnalyticsCommunityUseCase(
      service as unknown as AnalyticsCommunityService,
    );
    return { service, usecase };
  }

  it("returns a lazy root carrying the scalar fields and memoised loaders", async () => {
    const { service, usecase } = build();

    const root = await usecase.getCommunity({ input: baseInput }, adminCtx);

    expect(root.communityId).toBe("kibotcha");
    expect(root.communityName).toBe("きぼっちゃ");
    expect(root.asOf).toBe(asOf);
    expect(root.windowMonths).toBe(10); // DEFAULT_WINDOW_MONTHS
    expect(typeof root.loadMembers).toBe("function");
    expect(typeof root.loadMonthlyActivity).toBe("function");

    // getCommunity itself must not eagerly pull any of the heavy
    // sections — only the community-row lookup runs up front.
    expect(service.getCommunityById).toHaveBeenCalledTimes(1);
    expect(service.getMemberStats).not.toHaveBeenCalled();
    expect(service.getRetentionTrend).not.toHaveBeenCalled();
    expect(service.getCohortRetention).not.toHaveBeenCalled();
  });

  it("shares the member-stats query across every member-dependent field (memoised once)", async () => {
    const { service, usecase } = build();
    const root = await usecase.getCommunity({ input: baseInput }, adminCtx);

    await Promise.all([
      usecase.stages(root),
      usecase.memberList(root),
      usecase.dormantCount(root),
      usecase.tenureDistribution(root),
      usecase.cohortFunnel(root),
      usecase.summary(root, adminCtx),
    ]);

    expect(service.getMemberStats).toHaveBeenCalledTimes(1);
    expect(service.getMemberStats).toHaveBeenCalledWith(adminCtx, "kibotcha", asOf);
  });

  it("shares the monthly-activity query across monthlyActivityTrend and summary", async () => {
    const { service, usecase } = build();
    const root = await usecase.getCommunity({ input: baseInput }, adminCtx);

    await Promise.all([usecase.monthlyActivityTrend(root), usecase.summary(root, adminCtx)]);

    expect(service.getMonthlyActivity).toHaveBeenCalledTimes(1);
  });

  it("does not run retention/cohort fan-outs when only summary is selected", async () => {
    const { service, usecase } = build();
    const root = await usecase.getCommunity({ input: baseInput }, adminCtx);

    await usecase.summary(root, adminCtx);

    expect(service.getRetentionTrend).not.toHaveBeenCalled();
    expect(service.getCohortRetention).not.toHaveBeenCalled();
  });

  it("routes chainDepthDistribution / cohortFunnel through the presenter (Gql shape)", async () => {
    const { service, usecase } = build();
    const root = await usecase.getCommunity({ input: baseInput }, adminCtx);

    const chain = await usecase.chainDepthDistribution(root, adminCtx);
    expect(service.getChainDepthDistribution).toHaveBeenCalledWith(adminCtx, "kibotcha", asOf);
    expect(chain).toEqual([{ depth: 1, count: 3 }]);

    // Empty member set → funnel points exist (one per window month) but
    // with zero counts; the important assertion is the mapped shape.
    const funnel = await usecase.cohortFunnel(root);
    expect(Array.isArray(funnel)).toBe(true);
    funnel.forEach((p) => {
      expect(p).toEqual(
        expect.objectContaining({
          cohortMonth: expect.any(Date),
          acquired: expect.any(Number),
          activatedD30: expect.any(Number),
          repeated: expect.any(Number),
          habitual: expect.any(Number),
        }),
      );
    });
  });

  it("delegates alerts and hubMemberCount to the matching service methods", async () => {
    const { service, usecase } = build();
    const root = await usecase.getCommunity({ input: baseInput }, adminCtx);

    await expect(usecase.alerts(root, adminCtx)).resolves.toEqual({
      churnSpike: false,
      activeDrop: false,
      noNewMembers: false,
    });
    expect(service.getAlerts).toHaveBeenCalledWith(adminCtx, "kibotcha", asOf);

    await expect(usecase.hubMemberCount(root, adminCtx)).resolves.toBe(2);
  });
});
