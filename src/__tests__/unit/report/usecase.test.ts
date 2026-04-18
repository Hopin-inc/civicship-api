import "reflect-metadata";
import { ReportStatus } from "@prisma/client";
import { container } from "tsyringe";
import ReportUseCase from "@/application/domain/report/usecase";
import ReportService from "@/application/domain/report/service";
import type { WeeklyReportPayload } from "@/application/domain/report/presenter";
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
  >>;
  let llmClient: { complete: jest.Mock };
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
      // test-only: jest.Mocked<Pick<...>> doesn't satisfy the concrete
      // method return-type shape without extra layers; the narrowed mock
      // covers only what the skip path calls.
    } as never;

    llmClient = { complete: jest.fn() };

    container.register("ReportService", { useValue: service });
    container.register("LlmClient", { useValue: llmClient });

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
