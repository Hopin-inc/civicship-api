import "reflect-metadata";
import { ReportStatus } from "@prisma/client";
import { container } from "tsyringe";
import ReportUseCase from "@/application/domain/report/usecase";
import ReportService from "@/application/domain/report/service";
import type { WeeklyReportPayload } from "@/application/domain/report/presenter";
import type { IContext } from "@/types/server";
import { GqlReportVariant } from "@/types/graphql";

/**
 * `generateReport` is hard to unit-test end-to-end because it stitches
 * together template lookup, payload building, LLM invocation, transaction
 * orchestration, and persistence. The test below targets the narrow
 * behaviour of the zero-activity skip path: when `evaluateSkipReason`
 * returns a non-null reason, the LLM client is NOT invoked, and a
 * SKIPPED row is persisted with the reason attached.
 */
describe("ReportUseCase.generateReport — zero-activity skip path", () => {
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
      createReport: jest.fn().mockImplementation(async (_ctx, data) => ({
        id: "report-skip-1",
        communityId: data.communityId,
        variant: data.variant,
        periodFrom: data.periodFrom,
        periodTo: data.periodTo,
        templateId: data.templateId,
        inputPayload: data.inputPayload,
        outputMarkdown: null,
        model: null,
        systemPromptSnapshot: null,
        userPromptSnapshot: null,
        communityContextSnapshot: null,
        inputTokens: null,
        outputTokens: null,
        cacheReadTokens: null,
        status: data.status ?? ReportStatus.DRAFT,
        skipReason: data.skipReason ?? null,
        regenerateCount: data.regenerateCount ?? 0,
        parentRunId: data.parentRunId ?? null,
        targetUserId: null,
        generatedBy: null,
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
});
