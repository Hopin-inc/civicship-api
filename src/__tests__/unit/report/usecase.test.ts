import "reflect-metadata";
import { ReportStatus } from "@prisma/client";
import { container } from "tsyringe";
import ReportUseCase from "@/application/domain/report/usecase";
import ReportService from "@/application/domain/report/service";
import type { WeeklyReportPayload } from "@/application/domain/report/types";
import type { IContext } from "@/types/server";
import type { LlmCompleteResult } from "@/infrastructure/libs/llm/types";
import { GqlReportVariant } from "@/types/graphql";

/**
 * `generateReport` is hard to unit-test end-to-end because it stitches
 * together template lookup, payload building, LLM invocation, transaction
 * orchestration, and persistence. The three tests below target the
 * behaviour changes introduced by this PR:
 *
 *   1. zero-activity skip path — when `evaluateSkipReason` returns a
 *      non-null reason, the LLM client is NOT invoked and a SKIPPED row
 *      is persisted with the reason attached.
 *
 *   2. regenerate from a SKIPPED parent — the shared
 *      `supersedeParentIfRegenerating` helper moves the prior SKIPPED
 *      row to SUPERSEDED (covering the one state transition permitted
 *      out of SKIPPED) and the new row carries `parentRunId` +
 *      `regenerateCount + 1`.
 *
 *   3. LLM generation happy path — when `evaluateSkipReason` returns
 *      null, the LLM client is invoked and the resulting artefacts
 *      (markdown, model id, usage counters, prompt snapshots) land in
 *      the new row. The mocked `complete()` return matches the real
 *      `LlmCompleteResult` shape so a provider-side field rename would
 *      surface as a compile error here rather than a silent runtime
 *      drift.
 */
describe("ReportUseCase.generateReport", () => {
  const communityId = "kibotcha";

  const zeroActivityPayload: WeeklyReportPayload = {
    period: { from: "2026-04-11", to: "2026-04-17" },
    community_id: communityId,
    community_context: {
      community_id: communityId,
      name: "KIBOTCHA",
      point_name: "pt",
      bio: null,
      established_at: null,
      website: null,
      total_members: 566,
      active_users_in_window: 0,
      active_rate: 0,
      custom_context: null,
    },
    deepest_chain: null,
    daily_summaries: [],
    daily_active_users: [],
    top_users: [],
    highlight_comments: [],
    previous_period: null,
    retention: null,
  };

  const stubTemplate = {
    id: "tpl-1",
    variant: "WEEKLY_SUMMARY",
    scope: "SYSTEM",
    communityId: null,
    systemPrompt: "sys",
    userPromptTemplate: "user ${payload_json}",
    communityContext: null,
    model: "claude-sonnet-4-6",
    temperature: 0.5,
    maxTokens: 8192,
    stopSequences: [],
    isEnabled: true,
    version: 1,
    isActive: true,
    kind: "GENERATION",
  };

  // test-only: full TransactionClient mock unnecessary — the service call
  // is stubbed below, so the placeholder never has Prisma methods invoked.
  const fakeTx = {} as never;
  // test-only: production IContext pulls in issuer / auth / loader wiring
  // we don't exercise here; the cast keeps the mock shape minimal.
  const fakeCtx = {
    issuer: {
      onlyBelongingCommunity: (
        _ctx: IContext,
        fn: (tx: unknown) => Promise<unknown>,
      ): Promise<unknown> => fn(fakeTx),
    },
  } as unknown as IContext;

  let service: jest.Mocked<Pick<
    ReportService,
    | "getTemplate"
    | "evaluateSkipReason"
    | "createReport"
    | "getReportById"
    | "assertStatusTransition"
    | "updateReportStatus"
    | "saveJudgeResult"
  >>;
  let llmClient: { complete: jest.Mock };
  let judgeService: { selectJudgeTemplate: jest.Mock; executeJudge: jest.Mock };
  let usecase: ReportUseCase;

  beforeEach(() => {
    container.reset();

    service = {
      getTemplate: jest.fn().mockResolvedValue(stubTemplate),
      evaluateSkipReason: jest
        .fn()
        .mockReturnValue("No activity in period: active_users=0, daily_summaries=[]"),
      // Pass through every LLM / skip field the usecase sets so each
      // test can assert on what was actually written; defaults only
      // kick in for columns the caller didn't touch (audit fields etc).
      createReport: jest.fn().mockImplementation(async (_ctx, data) => ({
        id: "report-mock-id",
        communityId: data.communityId,
        variant: data.variant,
        periodFrom: data.periodFrom,
        periodTo: data.periodTo,
        templateId: data.templateId,
        inputPayload: data.inputPayload,
        outputMarkdown: data.outputMarkdown ?? null,
        model: data.model ?? null,
        systemPromptSnapshot: data.systemPromptSnapshot ?? null,
        userPromptSnapshot: data.userPromptSnapshot ?? null,
        communityContextSnapshot: data.communityContextSnapshot ?? null,
        inputTokens: data.inputTokens ?? null,
        outputTokens: data.outputTokens ?? null,
        cacheReadTokens: data.cacheReadTokens ?? null,
        status: data.status ?? ReportStatus.DRAFT,
        skipReason: data.skipReason ?? null,
        regenerateCount: data.regenerateCount ?? 0,
        parentRunId: data.parentRunId ?? null,
        targetUserId: null,
        generatedBy: data.generatedBy ?? null,
        publishedAt: null,
        publishedBy: null,
        finalContent: null,
        createdAt: new Date("2026-04-17T15:00:00Z"),
        updatedAt: null,
      })),
      getReportById: jest.fn(),
      assertStatusTransition: jest.fn(),
      updateReportStatus: jest.fn(),
      // saveJudgeResult is wired to return the latest createReport
      // result so the LLM happy-path assertions still see
      // outputMarkdown / status DRAFT after the judge step persists
      // judge fields. Tests that exercise judge results override this.
      saveJudgeResult: jest.fn().mockImplementation(async (_ctx, id, data) => {
        const lastCreateCall = service.createReport.mock.results.at(-1);
        const created = lastCreateCall ? await lastCreateCall.value : null;
        return {
          ...(created ?? { id }),
          judgeScore: data.judgeScore,
          judgeBreakdown: data.judgeBreakdown,
          judgeTemplateId: data.judgeTemplateId,
          coverageJson: data.coverageJson,
        };
      }),
      // test-only: jest.Mocked<Pick<...>> doesn't satisfy the concrete
      // method return-type shape without extra layers; the narrowed mock
      // covers only what the skip path calls.
    } as never;

    llmClient = { complete: jest.fn() };
    // Default: no judge template seeded for the variant under test, so
    // the usecase's judgeAndPersist short-circuits to a coverage-only
    // save. Tests that exercise the judge happy path override this.
    judgeService = {
      selectJudgeTemplate: jest.fn().mockResolvedValue(null),
      executeJudge: jest.fn(),
    };

    // Minimal ReportTemplateSelector mock: returns the canonical
    // stubTemplate regardless of inputs. Selector logic (A/B weighting,
    // community hash) lives in templateSelector.test.ts so the usecase
    // suite can stay focused on orchestration.
    const templateSelector = {
      selectTemplate: jest.fn().mockResolvedValue(stubTemplate),
    };

    container.register("ReportService", { useValue: service });
    container.register("LlmClient", { useValue: llmClient });
    container.register("ReportJudgeService", { useValue: judgeService });
    container.register("ReportTemplateSelector", { useValue: templateSelector });

    usecase = container.resolve(ReportUseCase);

    // Stub buildReportPayload so we don't touch the repository layer; the
    // skip check itself is what we want to exercise.
    jest.spyOn(usecase, "buildReportPayload").mockResolvedValue(zeroActivityPayload);
  });

  it("creates a SKIPPED report and does NOT invoke the LLM when activity is zero", async () => {
    const result = await usecase.generateReport(
      {
        input: {
          communityId,
          variant: GqlReportVariant.WeeklySummary,
          periodFrom: new Date("2026-04-11"),
          periodTo: new Date("2026-04-17"),
        },
        permission: { communityId },
      },
      fakeCtx,
    );

    expect(llmClient.complete).not.toHaveBeenCalled();
    expect(service.createReport).toHaveBeenCalledTimes(1);

    const createArgs = service.createReport.mock.calls[0][1];
    expect(createArgs.status).toBe(ReportStatus.SKIPPED);
    expect(createArgs.skipReason).toMatch(/^No activity in period:/);
    expect(createArgs.outputMarkdown).toBeUndefined();
    expect(createArgs.model).toBeUndefined();
    expect(createArgs.systemPromptSnapshot).toBeUndefined();

    expect(result.__typename).toBe("GenerateReportSuccess");
    if (result.__typename === "GenerateReportSuccess") {
      expect(result.report.status).toBe(ReportStatus.SKIPPED);
      expect(result.report.skipReason).toMatch(/^No activity in period:/);
    }
  });

  it("regenerates from a SKIPPED parent: parent is moved to SUPERSEDED and the new row carries parentRunId + regenerateCount+1", async () => {
    const parentId = "parent-skip-1";
    const parentRegenerateCount = 2;
    service.getReportById.mockResolvedValue({
      id: parentId,
      communityId,
      variant: "WEEKLY_SUMMARY",
      status: ReportStatus.SKIPPED,
      regenerateCount: parentRegenerateCount,
    } as never);

    const result = await usecase.generateReport(
      {
        input: {
          communityId,
          variant: GqlReportVariant.WeeklySummary,
          periodFrom: new Date("2026-04-11"),
          periodTo: new Date("2026-04-17"),
          parentRunId: parentId,
        },
        permission: { communityId },
      },
      fakeCtx,
    );

    // Parent SKIPPED → SUPERSEDED is the one transition out of SKIPPED
    // permitted by the state machine; the helper must assert + apply it.
    expect(service.assertStatusTransition).toHaveBeenCalledWith(
      ReportStatus.SKIPPED,
      ReportStatus.SUPERSEDED,
    );
    expect(service.updateReportStatus).toHaveBeenCalledWith(
      expect.anything(),
      parentId,
      ReportStatus.SUPERSEDED,
      undefined,
      expect.anything(),
    );

    // The new row lives on the regenerate chain: points back at the
    // parent and increments the counter.
    const createArgs = service.createReport.mock.calls[0][1];
    expect(createArgs.parentRunId).toBe(parentId);
    expect(createArgs.regenerateCount).toBe(parentRegenerateCount + 1);
    expect(createArgs.status).toBe(ReportStatus.SKIPPED);
    expect(createArgs.skipReason).toMatch(/^No activity in period:/);

    expect(result.__typename).toBe("GenerateReportSuccess");
    if (result.__typename === "GenerateReportSuccess") {
      expect(result.report.status).toBe(ReportStatus.SKIPPED);
    }
  });

  it("invokes the LLM and persists the generated artefacts when activity is non-zero", async () => {
    // Override the skip evaluator so the happy path runs. Using a
    // freshly-populated payload (not just flipping the stub) so that
    // regressions in the guard itself would still be caught by the
    // dedicated service-level evaluateSkipReason suite — here we only
    // care that the LLM branch wires its output into createReport.
    service.evaluateSkipReason.mockReturnValue(null);

    const activePayload: WeeklyReportPayload = {
      ...zeroActivityPayload,
      community_context: {
        ...zeroActivityPayload.community_context!,
        active_users_in_window: 26,
        active_rate: 0.046,
      },
      daily_summaries: [
        {
          date: "2026-04-14",
          reason: "DONATION",
          tx_count: 8,
          points_sum: 125830,
          chain_root_count: 0,
          chain_descendant_count: 8,
          max_chain_depth: 19,
          avg_chain_depth: 5,
          issuance_count: 0,
          burn_count: 0,
        },
      ],
    };
    jest.spyOn(usecase, "buildReportPayload").mockResolvedValue(activePayload);

    // Typed against the real LlmCompleteResult so a provider-side
    // contract change surfaces as a compile error here rather than a
    // silent drift between mock and reality.
    const llmResult: LlmCompleteResult = {
      text: "## KIBOTCHA 週次レポート\n...",
      model: "claude-sonnet-4-6",
      usage: {
        inputTokens: 10593,
        outputTokens: 3393,
        cacheReadTokens: 8192,
        cacheCreationTokens: 0,
      },
      stopReason: "end_turn",
    };
    llmClient.complete.mockResolvedValue(llmResult);

    const result = await usecase.generateReport(
      {
        input: {
          communityId,
          variant: GqlReportVariant.WeeklySummary,
          periodFrom: new Date("2026-04-11"),
          periodTo: new Date("2026-04-17"),
        },
        permission: { communityId },
      },
      fakeCtx,
    );

    expect(llmClient.complete).toHaveBeenCalledTimes(1);
    const llmArgs = llmClient.complete.mock.calls[0][0];
    expect(llmArgs.system[0].text).toBe(stubTemplate.systemPrompt);
    expect(llmArgs.model).toBe(stubTemplate.model);
    expect(llmArgs.maxTokens).toBe(stubTemplate.maxTokens);

    // The LLM artefacts must land on the persisted row; the row must
    // NOT get status=SKIPPED or a skipReason.
    const createArgs = service.createReport.mock.calls[0][1];
    expect(createArgs.status).toBeUndefined();
    expect(createArgs.skipReason).toBeUndefined();
    expect(createArgs.outputMarkdown).toBe(llmResult.text);
    expect(createArgs.model).toBe(llmResult.model);
    expect(createArgs.inputTokens).toBe(llmResult.usage.inputTokens);
    expect(createArgs.outputTokens).toBe(llmResult.usage.outputTokens);
    expect(createArgs.cacheReadTokens).toBe(llmResult.usage.cacheReadTokens);
    expect(createArgs.systemPromptSnapshot).toBe(stubTemplate.systemPrompt);

    expect(result.__typename).toBe("GenerateReportSuccess");
    if (result.__typename === "GenerateReportSuccess") {
      expect(result.report.status).toBe(ReportStatus.DRAFT);
      expect(result.report.outputMarkdown).toBe(llmResult.text);
    }
  });
});

describe("ReportUseCase.buildReportPayload retention window", () => {
  const communityId = "community-retention";

  function makeUseCase() {
    container.reset();
    // Capture the range passed into getRetentionAggregate so the test can
    // assert on the exact boundaries the inline week-math computes. Every
    // other service method is a no-op stub because the presenter just sees
    // empty lists / nulls and still assembles a payload.
    let capturedRetentionRange:
      | {
          currentWeekStart: Date;
          nextWeekStart: Date;
          prevWeekStart: Date;
          twelveWeeksAgo: Date;
        }
      | null = null;

    const service = {
      getDailySummaries: jest.fn().mockResolvedValue([]),
      getDailyActiveUsers: jest.fn().mockResolvedValue([]),
      getTopUsersByTotalPoints: jest.fn().mockResolvedValue([]),
      getComments: jest.fn().mockResolvedValue([]),
      getCommunityContext: jest.fn().mockResolvedValue(null),
      getDeepestChain: jest.fn().mockResolvedValue(null),
      getPeriodAggregate: jest.fn().mockResolvedValue({
        activeUsersInWindow: 0,
        totalTxCount: 0,
        totalPointsSum: 0n,
        newMembers: 0,
      }),
      getRetentionAggregate: jest.fn().mockImplementation(async (_ctx, _communityId, range) => {
        capturedRetentionRange = range;
        return {
          newMembers: 0,
          retainedSenders: 0,
          returnedSenders: 0,
          churnedSenders: 0,
          currentSendersCount: 0,
          currentActiveCount: 0,
        };
      }),
      getCohortRetention: jest
        .fn()
        .mockResolvedValue({ cohortSize: 0, activeNextWeek: 0 }),
      getUserProfiles: jest.fn().mockResolvedValue([]),
      getTrueUniqueCounterpartiesForUsers: jest.fn().mockResolvedValue(new Map()),
    };

    container.register("ReportService", { useValue: service });
    container.register("LlmClient", { useValue: { complete: jest.fn() } });
    container.register("ReportJudgeService", {
      useValue: { selectJudgeTemplate: jest.fn(), executeJudge: jest.fn() },
    });
    container.register("ReportTemplateSelector", {
      useValue: { selectTemplate: jest.fn() },
    });

    return {
      service,
      usecase: container.resolve(ReportUseCase),
      getCapturedRange: () => capturedRetentionRange,
    };
  }

  // Regression guard for the -7*11 → -7*12 fix. `returned_senders` keys on
  // the half-open `[twelveWeeksAgo, prevWeekStart)` window: 84 days covers
  // 12 full weeks; the prior -7*11 (77 days) only covered 11, silently
  // under-counting the 12th-week returners.
  it("passes range.twelveWeeksAgo exactly 84 days before prevWeekStart to service.getRetentionAggregate", async () => {
    const { usecase, service, getCapturedRange } = makeUseCase();
    const fakeCtx = {} as unknown as IContext;

    await usecase.buildReportPayload(fakeCtx, {
      communityId,
      // Wednesday → current-week Monday is the JST Monday of that week.
      referenceDate: new Date(Date.UTC(2026, 3, 22)),
      includeRetention: true,
    });

    expect(service.getRetentionAggregate).toHaveBeenCalledTimes(1);
    const range = getCapturedRange();
    expect(range).not.toBeNull();
    const diffDays =
      (range!.prevWeekStart.getTime() - range!.twelveWeeksAgo.getTime()) / (24 * 60 * 60 * 1000);
    expect(diffDays).toBe(84);
    // prevWeekStart is one week before currentWeekStart by definition —
    // locking this down so the 84-day assertion keeps its meaning even if
    // the currentWeekStart computation itself regresses.
    const prevVsCurrentDays =
      (range!.currentWeekStart.getTime() - range!.prevWeekStart.getTime()) /
      (24 * 60 * 60 * 1000);
    expect(prevVsCurrentDays).toBe(7);
  });
});

describe("ReportUseCase.updateReportTemplate trafficWeight validation (PR-F3)", () => {
  // The DB has a CHECK constraint on trafficWeight BETWEEN 0 AND 100, but
  // a constraint violation surfaces as an opaque PrismaClientKnownRequestError
  // at the admin UI. These tests pin down the app-layer guard that turns
  // a bad value into a structured ValidationError *before* the Prisma call.
  const fakeCtx = {
    currentUser: { id: "admin-1", sysRole: "SYS_ADMIN" },
    issuer: {
      admin: (_ctx: IContext, fn: (tx: unknown) => Promise<unknown>) => fn({} as never),
    },
  } as unknown as IContext;

  function makeUseCase() {
    container.reset();
    const service = {
      upsertTemplate: jest.fn().mockResolvedValue({ id: "tpl-1" }),
    };
    container.register("ReportService", { useValue: service });
    container.register("LlmClient", { useValue: { complete: jest.fn() } });
    container.register("ReportJudgeService", {
      useValue: { selectJudgeTemplate: jest.fn(), executeJudge: jest.fn() },
    });
    container.register("ReportTemplateSelector", {
      useValue: { selectTemplate: jest.fn() },
    });
    return { service, usecase: container.resolve(ReportUseCase) };
  }

  const baseInput = {
    systemPrompt: "sys",
    userPromptTemplate: "user ${payload_json}",
    communityContext: null,
    model: "claude-sonnet-4-6",
    temperature: 0.5,
    maxTokens: 8192,
    stopSequences: [],
    isEnabled: true,
  };

  it.each([-1, 101, 3.5])(
    "rejects trafficWeight=%s with ValidationError",
    async (trafficWeight) => {
      const { usecase, service } = makeUseCase();
      await expect(
        usecase.updateReportTemplate(
          {
            variant: GqlReportVariant.WeeklySummary,
            input: { ...baseInput, trafficWeight } as never,
          },
          fakeCtx,
        ),
      ).rejects.toThrow(/trafficWeight/);
      expect(service.upsertTemplate).not.toHaveBeenCalled();
    },
  );

  it("accepts trafficWeight in 0..100", async () => {
    const { usecase, service } = makeUseCase();
    await usecase.updateReportTemplate(
      {
        variant: GqlReportVariant.WeeklySummary,
        input: { ...baseInput, trafficWeight: 50 } as never,
      },
      fakeCtx,
    );
    expect(service.upsertTemplate).toHaveBeenCalled();
  });

  it("accepts an omitted trafficWeight (leaves server default)", async () => {
    const { usecase, service } = makeUseCase();
    await usecase.updateReportTemplate(
      {
        variant: GqlReportVariant.WeeklySummary,
        input: baseInput as never,
      },
      fakeCtx,
    );
    expect(service.upsertTemplate).toHaveBeenCalled();
  });
});

/**
 * A-3 maintenance contract: when `supersedeParentIfRegenerating`
 * transitions a parent to SUPERSEDED, the community's denormalized
 * last-publish pointer (`t_communities.last_published_report_*`) only
 * needs to be re-derived when the parent was actually PUBLISHED. For
 * DRAFT / APPROVED / SKIPPED parents the pointer was never on this
 * row, so the extra UPDATE would be wasted. publishReport itself
 * always recalcs because it just produced a new PUBLISHED row.
 */
describe("ReportUseCase A-3 community last-publish pointer maintenance", () => {
  const communityId = "kibotcha";
  const fakeTx = {} as never;
  const fakeCtx = {
    issuer: {
      onlyBelongingCommunity: (
        _ctx: IContext,
        fn: (tx: unknown) => Promise<unknown>,
      ): Promise<unknown> => fn(fakeTx),
      admin: (
        _ctx: IContext,
        fn: (tx: unknown) => Promise<unknown>,
      ): Promise<unknown> => fn(fakeTx),
    },
    currentUser: { id: "admin-user" },
  } as unknown as IContext;

  const stubTemplate = {
    id: "tpl-1",
    variant: "WEEKLY_SUMMARY",
    scope: "SYSTEM",
    communityId: null,
    systemPrompt: "sys",
    userPromptTemplate: "user ${payload_json}",
    communityContext: null,
    model: "claude-sonnet-4-6",
    temperature: 0.5,
    maxTokens: 8192,
    stopSequences: [],
    isEnabled: true,
    version: 1,
    isActive: true,
    kind: "GENERATION",
  };

  let service: jest.Mocked<Pick<
    ReportService,
    | "getTemplate"
    | "evaluateSkipReason"
    | "createReport"
    | "getReportById"
    | "assertStatusTransition"
    | "updateReportStatus"
    | "saveJudgeResult"
    | "recalculateCommunityLastPublished"
  >>;
  let usecase: ReportUseCase;
  let llmClient: { complete: jest.Mock };
  let judgeService: { selectJudgeTemplate: jest.Mock; executeJudge: jest.Mock };

  beforeEach(() => {
    container.reset();
    service = {
      getTemplate: jest.fn().mockResolvedValue(stubTemplate),
      evaluateSkipReason: jest.fn().mockReturnValue("No activity in period: skip"),
      createReport: jest.fn().mockImplementation(async (_ctx, data) => ({
        id: "new-report-id",
        communityId: data.communityId,
        variant: data.variant,
        status: data.status ?? ReportStatus.DRAFT,
        regenerateCount: data.regenerateCount ?? 0,
        parentRunId: data.parentRunId ?? null,
        publishedAt: null,
      })),
      getReportById: jest.fn(),
      assertStatusTransition: jest.fn(),
      updateReportStatus: jest.fn().mockImplementation(async (_ctx, id, status) => ({
        id,
        communityId,
        status,
        publishedAt: status === ReportStatus.PUBLISHED ? new Date() : null,
      })),
      saveJudgeResult: jest.fn(),
      recalculateCommunityLastPublished: jest.fn().mockResolvedValue(undefined),
    } as never;

    llmClient = { complete: jest.fn() };
    judgeService = {
      selectJudgeTemplate: jest.fn().mockResolvedValue(null),
      executeJudge: jest.fn(),
    };
    const templateSelector = {
      selectTemplate: jest.fn().mockResolvedValue(stubTemplate),
    };

    container.register("ReportService", { useValue: service });
    container.register("LlmClient", { useValue: llmClient });
    container.register("ReportJudgeService", { useValue: judgeService });
    container.register("ReportTemplateSelector", { useValue: templateSelector });

    usecase = container.resolve(ReportUseCase);

    // Stub buildReportPayload so tests don't reach into the
    // repository layer — the SUPERSEDED → recalc behaviour is
    // independent of the payload contents, and the skip evaluator is
    // already forced to return "skip" so no LLM call happens.
    jest.spyOn(usecase, "buildReportPayload").mockResolvedValue({
      period: { from: "2026-04-11", to: "2026-04-17" },
      community_id: communityId,
      community_context: null,
      deepest_chain: null,
      daily_summaries: [],
      daily_active_users: [],
      top_users: [],
      highlight_comments: [],
      previous_period: null,
      retention: null,
    });
  });

  it("publishReport always re-derives the community pointer in the same transaction", async () => {
    service.getReportById.mockResolvedValue({
      id: "report-1",
      communityId,
      status: ReportStatus.APPROVED,
    } as never);

    await usecase.publishReport(
      { id: "report-1", finalContent: "# Final" },
      fakeCtx,
    );

    expect(service.recalculateCommunityLastPublished).toHaveBeenCalledTimes(1);
    expect(service.recalculateCommunityLastPublished).toHaveBeenCalledWith(
      expect.anything(),
      communityId,
      fakeTx,
    );
  });

  it("regenerate from PUBLISHED parent triggers recalc (parent's pointer must move on)", async () => {
    service.evaluateSkipReason.mockReturnValue("skip");
    service.getReportById.mockResolvedValue({
      id: "parent-pub",
      communityId,
      variant: "WEEKLY_SUMMARY",
      status: ReportStatus.PUBLISHED,
      regenerateCount: 0,
    } as never);

    await usecase.generateReport(
      {
        input: {
          communityId,
          variant: GqlReportVariant.WeeklySummary,
          periodFrom: new Date("2026-04-11"),
          periodTo: new Date("2026-04-17"),
          parentRunId: "parent-pub",
        },
        permission: { communityId },
      },
      fakeCtx,
    );

    expect(service.recalculateCommunityLastPublished).toHaveBeenCalledTimes(1);
    expect(service.recalculateCommunityLastPublished).toHaveBeenCalledWith(
      expect.anything(),
      communityId,
      fakeTx,
    );
  });

  it.each([
    ["DRAFT", ReportStatus.DRAFT],
    ["APPROVED", ReportStatus.APPROVED],
    ["SKIPPED", ReportStatus.SKIPPED],
  ])(
    "regenerate from %s parent does NOT trigger recalc (pointer was never on this row)",
    async (_label, parentStatus) => {
      service.evaluateSkipReason.mockReturnValue("skip");
      service.getReportById.mockResolvedValue({
        id: "parent-x",
        communityId,
        variant: "WEEKLY_SUMMARY",
        status: parentStatus,
        regenerateCount: 0,
      } as never);

      await usecase.generateReport(
        {
          input: {
            communityId,
            variant: GqlReportVariant.WeeklySummary,
            periodFrom: new Date("2026-04-11"),
            periodTo: new Date("2026-04-17"),
            parentRunId: "parent-x",
          },
          permission: { communityId },
        },
        fakeCtx,
      );

      expect(service.recalculateCommunityLastPublished).not.toHaveBeenCalled();
    },
  );
});

/**
 * Phase 1 + Phase 2 admin query orchestration. These tests don't
 * exercise the SQL paths (those need integration tests with a live
 * Postgres) — they verify the usecase forwards args correctly and
 * coalesces nullable codegen args (the GraphQL schema declares
 * defaults but codegen still emits each arg as `Maybe<T>`, so the
 * usecase must apply the default itself).
 */
describe("ReportUseCase admin queries (Phase 1 + Phase 2)", () => {
  const communityId = "kibotcha";
  const fakeCtx = {} as IContext;

  let service: jest.Mocked<Pick<
    ReportService,
    "listTemplates" | "getAllReports" | "getCommunityReportSummary"
  >>;
  let usecase: ReportUseCase;

  beforeEach(() => {
    container.reset();
    service = {
      listTemplates: jest.fn().mockResolvedValue([]),
      getAllReports: jest.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      getCommunityReportSummary: jest.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    } as never;
    container.register("ReportService", { useValue: service });
    container.register("LlmClient", { useValue: { complete: jest.fn() } });
    container.register("ReportJudgeService", {
      useValue: { selectJudgeTemplate: jest.fn(), executeJudge: jest.fn() },
    });
    container.register("ReportTemplateSelector", {
      useValue: { selectTemplate: jest.fn() },
    });
    usecase = container.resolve(ReportUseCase);
  });

  it("listReportTemplates defaults kind to GENERATION when caller omits it", async () => {
    await usecase.listReportTemplates(
      {
        variant: GqlReportVariant.WeeklySummary,
      },
      fakeCtx,
    );
    // Concrete enum value, not undefined / null — repository contract
    // requires a non-null kind on the where clause.
    expect(service.listTemplates).toHaveBeenCalledWith(
      fakeCtx,
      GqlReportVariant.WeeklySummary,
      null,
      "GENERATION",
      false,
    );
  });

  it("listReportTemplates threads explicit JUDGE kind through", async () => {
    await usecase.listReportTemplates(
      {
        variant: GqlReportVariant.WeeklySummary,
        kind: "JUDGE" as never,
        includeInactive: true,
      },
      fakeCtx,
    );
    expect(service.listTemplates).toHaveBeenCalledWith(
      fakeCtx,
      GqlReportVariant.WeeklySummary,
      null,
      "JUDGE",
      true,
    );
  });

  it("adminBrowseReports forwards filters and converts ISO strings to Date", async () => {
    await usecase.adminBrowseReports(
      {
        communityId,
        status: ReportStatus.PUBLISHED,
        variant: GqlReportVariant.WeeklySummary,
        publishedAfter: "2026-01-01T00:00:00Z" as never,
        publishedBefore: "2026-04-01T00:00:00Z" as never,
        cursor: "cursor-x",
        first: 30,
      },
      fakeCtx,
    );
    expect(service.getAllReports).toHaveBeenCalledWith(
      fakeCtx,
      expect.objectContaining({
        communityId,
        status: ReportStatus.PUBLISHED,
        variant: GqlReportVariant.WeeklySummary,
        publishedAfter: expect.any(Date),
        publishedBefore: expect.any(Date),
        cursor: "cursor-x",
        first: 30,
      }),
    );
  });

  it("adminBrowseReports clamps `first` to defaults when omitted and rejects out-of-range values", async () => {
    await usecase.adminBrowseReports({}, fakeCtx);
    expect(service.getAllReports.mock.calls[0][1].first).toBe(20);

    await expect(
      usecase.adminBrowseReports({ first: 500 }, fakeCtx),
    ).rejects.toThrow(/first must be an integer between 1 and 100/);
  });

  it("adminViewReportSummary clamps `first` and forwards cursor", async () => {
    await usecase.adminViewReportSummary(
      { cursor: "comm-cursor", first: 50 },
      fakeCtx,
    );
    expect(service.getCommunityReportSummary).toHaveBeenCalledWith(
      fakeCtx,
      { cursor: "comm-cursor", first: 50 },
    );
  });
});
