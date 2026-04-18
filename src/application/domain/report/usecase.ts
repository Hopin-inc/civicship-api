import { Prisma, ReportStatus } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { ValidationError } from "@/errors/graphql";
import ReportService from "@/application/domain/report/service";
import ReportJudgeService, { JudgeParseError } from "@/application/domain/report/judgeService";
import ReportPresenter from "@/application/domain/report/presenter";
import { WeeklyReportPayload } from "@/application/domain/report/types";
import { addDays, daysBetweenJst, truncateToJstDate } from "@/application/domain/report/util";
import { renderPromptTemplate } from "@/application/domain/report/util/promptRenderer";
import { analyzeCoverage } from "@/application/domain/report/util/coverage";
import { LlmClient } from "@/infrastructure/libs/llm";
import {
  GqlGenerateReportPayload,
  GqlReportsConnection,
  GqlReport,
  GqlReportTemplate,
  GqlUpdateReportTemplatePayload,
  GqlApproveReportPayload,
  GqlPublishReportPayload,
  GqlRejectReportPayload,
  GqlMutationGenerateReportArgs,
  GqlMutationUpdateReportTemplateArgs,
  GqlMutationApproveReportArgs,
  GqlMutationPublishReportArgs,
  GqlMutationRejectReportArgs,
  GqlQueryReportsArgs,
  GqlQueryReportArgs,
  GqlQueryReportTemplateArgs,
} from "@/types/graphql";

const LLM_TIMEOUT_MS = 180_000;
const DEFAULT_REPORTS_PER_PAGE = 20;
const MAX_REPORTS_PER_PAGE = 100;

const DEFAULT_WINDOW_DAYS = 7;
const DEFAULT_TOP_N = 10;
const DEFAULT_COMMENT_LIMIT = 200;
const MAX_WINDOW_DAYS = 90;
const MAX_TOP_N = 100;
const MAX_COMMENT_LIMIT = 1000;

@injectable()
export default class ReportUseCase {
  constructor(
    @inject("ReportService") private readonly service: ReportService,
    @inject("LlmClient") private readonly llmClient: LlmClient,
    @inject("ReportJudgeService") private readonly judgeService: ReportJudgeService,
  ) {}

  /**
   * Build the AI-facing data payload for a fixed-length report window ending
   * at `referenceDate` (inclusive). Default window is 7 days (weekly).
   *
   * Callers are responsible for authorization: only users belonging to the
   * target community (or system admins) should reach this usecase, because
   * materialized views bypass RLS.
   */
  async buildReportPayload(
    ctx: IContext,
    params: {
      communityId: string;
      referenceDate: Date;
      windowDays?: number;
      topN?: number;
      commentLimit?: number;
      customContext?: string;
    },
  ): Promise<WeeklyReportPayload> {
    const windowDays = clampInt(
      params.windowDays ?? DEFAULT_WINDOW_DAYS,
      1,
      MAX_WINDOW_DAYS,
      "windowDays",
    );
    const topN = clampInt(params.topN ?? DEFAULT_TOP_N, 1, MAX_TOP_N, "topN");
    const commentLimit = clampInt(
      params.commentLimit ?? DEFAULT_COMMENT_LIMIT,
      0,
      MAX_COMMENT_LIMIT,
      "commentLimit",
    );

    const to = truncateToJstDate(params.referenceDate);
    const from = addDays(to, -(windowDays - 1));
    const range = { from, to };

    const [summaries, activeUsers, topUserAggregates, comments, communityContext, deepestChain] =
      await Promise.all([
        this.service.getDailySummaries(ctx, params.communityId, range),
        this.service.getDailyActiveUsers(ctx, params.communityId, range),
        this.service.getTopUsersByTotalPoints(ctx, params.communityId, range, topN),
        this.service.getComments(ctx, params.communityId, range, commentLimit),
        this.service.getCommunityContext(ctx, params.communityId, range),
        this.service.getDeepestChain(ctx, params.communityId, range),
      ]);

    const userIds = topUserAggregates.map((u) => u.userId);
    const profiles = await this.service.getUserProfiles(ctx, params.communityId, userIds);

    return ReportPresenter.weeklyPayload({
      communityId: params.communityId,
      range,
      referenceDate: to,
      summaries,
      activeUsers,
      topUserAggregates,
      profiles,
      comments,
      communityContext,
      deepestChain,
      customContext: params.customContext,
    });
  }

  /**
   * Refresh the two materialized views backing the report dataset. Called
   * from the daily batch.
   *
   * Each refresh runs in its own bypass-RLS transaction (per CLAUDE.md:
   * transactions are managed at the UseCase layer, not the Service layer).
   * They are sequential rather than parallel to keep DB load predictable
   * during the nightly window.
   *
   * Note: active-user counts no longer have a dedicated MV — they are
   * derived at query time from mv_user_transaction_daily.
   */
  // =========================================================================
  // AI Report Generation
  // =========================================================================

  async generateReport(
    { input, permission }: GqlMutationGenerateReportArgs,
    ctx: IContext,
  ): Promise<GqlGenerateReportPayload> {
    if (permission.communityId !== input.communityId) {
      throw new ValidationError("communityId in input does not match permission.communityId", []);
    }
    const communityId = permission.communityId;
    const template = await this.service.getTemplate(ctx, input.variant, communityId);
    if (!template) {
      throw new Error(
        `No enabled template found for variant=${input.variant}, communityId=${communityId}`,
      );
    }

    const periodFrom = truncateToJstDate(input.periodFrom);
    const periodTo = truncateToJstDate(input.periodTo);

    if (daysBetweenJst(periodFrom, periodTo) < 0) {
      throw new ValidationError("periodFrom must be on or before periodTo", [
        "periodFrom",
        "periodTo",
      ]);
    }
    const windowDays = daysBetweenJst(periodFrom, periodTo) + 1;
    if (windowDays > MAX_WINDOW_DAYS) {
      throw new ValidationError(
        `Report window cannot exceed ${MAX_WINDOW_DAYS} days (requested ${windowDays})`,
        ["periodFrom", "periodTo"],
      );
    }
    const payload = await this.buildReportPayload(ctx, {
      communityId,
      referenceDate: periodTo,
      windowDays,
      customContext: template.communityContext ?? undefined,
    });

    // Short-circuit on zero activity: no LLM call, no prompt snapshot, no
    // token usage. The row is still created (same regenerate / supersede
    // semantics) so the weekly report timeline has an explicit "nothing
    // happened" entry instead of a gap — `status = SKIPPED` and
    // `skipReason` carry the rationale.
    const skipReason = this.service.evaluateSkipReason(payload);
    if (skipReason) {
      const skippedReport = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
        const base = await this.buildReportCreateBase(
          ctx,
          tx,
          input,
          communityId,
          template.id,
          payload,
          periodFrom,
          periodTo,
        );
        return this.service.createReport(
          ctx,
          { ...base, status: ReportStatus.SKIPPED, skipReason },
          tx,
        );
      });
      return {
        __typename: "GenerateReportSuccess",
        report: ReportPresenter.report(skippedReport),
      };
    }

    const userPrompt = renderPromptTemplate(template.userPromptTemplate, {
      payload_json: JSON.stringify(payload),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
    let llmResult;
    try {
      llmResult = await this.llmClient.complete({
        system: [{ text: template.systemPrompt, cache: true }],
        messages: [{ role: "user", content: userPrompt }],
        model: template.model,
        maxTokens: template.maxTokens,
        ...(template.temperature !== null && { temperature: template.temperature }),
        ...(template.stopSequences.length > 0 && { stopSequences: template.stopSequences }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const report = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const base = await this.buildReportCreateBase(
        ctx,
        tx,
        input,
        communityId,
        template.id,
        payload,
        periodFrom,
        periodTo,
      );
      return this.service.createReport(
        ctx,
        {
          ...base,
          outputMarkdown: llmResult.text,
          model: llmResult.model,
          systemPromptSnapshot: template.systemPrompt,
          userPromptSnapshot: userPrompt,
          communityContextSnapshot: template.communityContext,
          inputTokens: llmResult.usage.inputTokens,
          outputTokens: llmResult.usage.outputTokens,
          cacheReadTokens: llmResult.usage.cacheReadTokens,
        },
        tx,
      );
    });

    // Judge runs in a separate transaction after the report row exists.
    // We deliberately do NOT roll the generation back if the judge step
    // fails — judge failures are observability data, not a generation
    // halt. Network errors and JSON parse errors both bubble out of
    // judgeAndPersist and are caught here so generateReport always
    // returns the persisted row.
    const judgedReport = await this.judgeAndPersist(ctx, report, payload, llmResult.text);

    return { __typename: "GenerateReportSuccess", report: ReportPresenter.report(judgedReport) };
  }

  /**
   * Best-effort judge run. Returns the original report unchanged when:
   *  - no JUDGE template is seeded for the variant (Phase 1: only
   *    WEEKLY_SUMMARY has one), or
   *  - the LLM call / parse throws (logged via console.warn so the
   *    failure surfaces in the operations log; we deliberately do not
   *    propagate so a transient Anthropic outage does not abort
   *    generation).
   *
   * The coverage analysis is computed unconditionally (it is a pure
   * substring scan) and persisted alongside the judge result so a
   * judge-step failure still leaves the cheaper signal intact.
   */
  private async judgeAndPersist(
    ctx: IContext,
    report: Awaited<ReturnType<ReportService["createReport"]>>,
    payload: WeeklyReportPayload,
    outputMarkdown: string,
  ) {
    let judgeTemplate;
    try {
      judgeTemplate = await this.judgeService.selectJudgeTemplate(ctx, report.variant);
    } catch (e) {
      // Template selection only throws when a misconfigured row slips
      // past the seed-side guard (COMMUNITY-scope JUDGE). Treat it as
      // a config problem distinct from runtime LLM failure so ops can
      // alert on it specifically.
      console.warn(
        JSON.stringify({
          event: "report.judge.failed",
          reason: "template_config_error",
          reportId: report.id,
          variant: report.variant,
          message: (e as Error).message,
        }),
      );
      return report;
    }

    const coverage = analyzeCoverage(payload, outputMarkdown);

    if (!judgeTemplate) {
      // No judge wired up for this variant yet — persist coverage on
      // its own so the field is not perpetually null for variants that
      // never get a judge prompt.
      return ctx.issuer.onlyBelongingCommunity(ctx, (tx) =>
        this.service.saveJudgeResult(
          ctx,
          report.id,
          {
            judgeScore: null,
            judgeBreakdown: null,
            judgeTemplateId: null,
            coverageJson: coverage as unknown as Prisma.InputJsonValue,
          },
          tx,
        ),
      );
    }

    let judgeResult;
    try {
      judgeResult = await this.judgeService.executeJudge(ctx, judgeTemplate, {
        outputMarkdown,
        inputPayload: payload,
      });
    } catch (e) {
      // Bucket the two failure modes so downstream alerting can route
      // them differently:
      //   - parse_failure: judge prompt is producing malformed output;
      //     this is a prompt-quality regression and should page on
      //     repeat occurrence.
      //   - llm_failure: transient (network / rate limit / abort);
      //     same prompt will likely succeed on the next run.
      // We log structured-ish JSON so log aggregation can parse a
      // single field rather than regex the message string.
      const isParseError = e instanceof JudgeParseError;
      const logPayload = {
        event: "report.judge.failed",
        reason: isParseError ? "parse_failure" : "llm_failure",
        reportId: report.id,
        variant: report.variant,
        judgeTemplateId: judgeTemplate.id,
        message: (e as Error).message,
        ...(isParseError && {
          rawResponseSample: (e as JudgeParseError).rawResponse.slice(0, 200),
        }),
      };
      console.warn(JSON.stringify(logPayload));
      return ctx.issuer.onlyBelongingCommunity(ctx, (tx) =>
        this.service.saveJudgeResult(
          ctx,
          report.id,
          {
            judgeScore: null,
            judgeBreakdown: null,
            judgeTemplateId: judgeTemplate.id,
            coverageJson: coverage as unknown as Prisma.InputJsonValue,
          },
          tx,
        ),
      );
    }

    return ctx.issuer.onlyBelongingCommunity(ctx, (tx) =>
      this.service.saveJudgeResult(
        ctx,
        report.id,
        {
          judgeScore: judgeResult.score,
          judgeBreakdown: judgeResult as unknown as Prisma.InputJsonValue,
          judgeTemplateId: judgeTemplate.id,
          coverageJson: coverage as unknown as Prisma.InputJsonValue,
        },
        tx,
      ),
    );
  }

  /**
   * Build the fields shared by skip-path and LLM-path Report inserts:
   * identifying columns, the immutable payload snapshot, the regenerate
   * chain trailer (when the run supersedes a parent), and the `generatedBy`
   * audit trailer. Also runs the parent SUPERSEDED transition so the chain
   * is in a consistent state before the new row is persisted.
   *
   * Keeping this shared prevents the two code paths from drifting — e.g. a
   * future change to `generatedBy` or regenerate bookkeeping lands in one
   * place rather than needing mirror edits in both.
   */
  private async buildReportCreateBase(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    input: { variant: string; parentRunId?: string | null },
    communityId: string,
    templateId: string,
    payload: WeeklyReportPayload,
    periodFrom: Date,
    periodTo: Date,
  ): Promise<Prisma.ReportUncheckedCreateInput> {
    // `communityId` is sourced from the already-authorized
    // `permission.communityId` upstream, rather than re-reading
    // `payload.community_id`, so the two cannot drift if the payload
    // builder's responsibilities change later.
    const parentRegenerateCount = await this.supersedeParentIfRegenerating(
      ctx,
      input.parentRunId ?? null,
      communityId,
      input.variant,
      tx,
    );
    return {
      communityId,
      variant: input.variant,
      periodFrom,
      periodTo,
      templateId,
      inputPayload: payload,
      ...(input.parentRunId && {
        parentRunId: input.parentRunId,
        regenerateCount: parentRegenerateCount + 1,
      }),
      ...(ctx.currentUser && { generatedBy: ctx.currentUser.id }),
    };
  }

  /**
   * Shared parent-run lookup / supersede for both the skip and LLM paths.
   * Validates the parent belongs to the same community + variant and moves
   * it to SUPERSEDED (unless already there). Returns the parent's existing
   * `regenerateCount` so the caller can set `parentRegenerateCount + 1` on
   * the new row.
   */
  private async supersedeParentIfRegenerating(
    ctx: IContext,
    parentRunId: string | null,
    communityId: string,
    variant: string,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    if (!parentRunId) return 0;
    const parent = await this.service.getReportById(ctx, parentRunId, tx);
    if (!parent) throw new Error(`Parent report ${parentRunId} not found`);
    if (parent.communityId !== communityId || parent.variant !== variant) {
      throw new Error("Parent report must belong to the same community and variant");
    }
    if (parent.status !== ReportStatus.SUPERSEDED) {
      this.service.assertStatusTransition(parent.status, ReportStatus.SUPERSEDED);
      await this.service.updateReportStatus(
        ctx,
        parentRunId,
        ReportStatus.SUPERSEDED,
        undefined,
        tx,
      );
    }
    return parent.regenerateCount;
  }

  async browseReports(
    { communityId, variant, status, cursor, first, permission }: GqlQueryReportsArgs,
    ctx: IContext,
  ): Promise<GqlReportsConnection> {
    if (permission.communityId !== communityId) {
      throw new ValidationError("communityId does not match permission.communityId", []);
    }
    const clampedFirst = first
      ? clampInt(first, 1, MAX_REPORTS_PER_PAGE, "first")
      : DEFAULT_REPORTS_PER_PAGE;
    const result = await this.service.getReports(ctx, {
      communityId,
      variant: variant ?? undefined,
      status: status ?? undefined,
      cursor: cursor ?? undefined,
      first: clampedFirst,
    });
    return ReportPresenter.reportsConnection(result.items, result.totalCount, clampedFirst);
  }

  async viewReport({ id }: GqlQueryReportArgs, ctx: IContext): Promise<GqlReport | null> {
    const report = await this.service.getReportById(ctx, id);
    return report ? ReportPresenter.report(report) : null;
  }

  async viewReportTemplate(
    { communityId, variant }: GqlQueryReportTemplateArgs,
    ctx: IContext,
  ): Promise<GqlReportTemplate | null> {
    const template = await this.service.getTemplate(ctx, variant, communityId ?? null);
    return template ? ReportPresenter.reportTemplate(template) : null;
  }

  async updateReportTemplate(
    { communityId, variant, input }: GqlMutationUpdateReportTemplateArgs,
    ctx: IContext,
  ): Promise<GqlUpdateReportTemplatePayload> {
    const template = await ctx.issuer.admin(ctx, (tx) =>
      this.service.upsertTemplate(
        ctx,
        variant,
        communityId ?? null,
        input,
        ctx.currentUser!.id,
        tx,
      ),
    );
    return {
      __typename: "UpdateReportTemplateSuccess",
      reportTemplate: ReportPresenter.reportTemplate(template),
    };
  }

  async approveReport(
    { id }: GqlMutationApproveReportArgs,
    ctx: IContext,
  ): Promise<GqlApproveReportPayload> {
    const report = await ctx.issuer.admin(ctx, async (tx) => {
      const existing = await this.service.getReportById(ctx, id, tx);
      if (!existing) throw new Error(`Report ${id} not found`);
      this.service.assertStatusTransition(existing.status, ReportStatus.APPROVED);
      return this.service.updateReportStatus(ctx, id, ReportStatus.APPROVED, undefined, tx);
    });
    return { __typename: "ApproveReportSuccess", report: ReportPresenter.report(report) };
  }

  async publishReport(
    { id, finalContent }: GqlMutationPublishReportArgs,
    ctx: IContext,
  ): Promise<GqlPublishReportPayload> {
    const report = await ctx.issuer.admin(ctx, async (tx) => {
      const existing = await this.service.getReportById(ctx, id, tx);
      if (!existing) throw new Error(`Report ${id} not found`);
      this.service.assertStatusTransition(existing.status, ReportStatus.PUBLISHED);
      return this.service.updateReportStatus(
        ctx,
        id,
        ReportStatus.PUBLISHED,
        {
          publishedAt: new Date(),
          publishedBy: ctx.currentUser?.id,
          finalContent,
        },
        tx,
      );
    });
    return { __typename: "PublishReportSuccess", report: ReportPresenter.report(report) };
  }

  async rejectReport(
    { id }: GqlMutationRejectReportArgs,
    ctx: IContext,
  ): Promise<GqlRejectReportPayload> {
    const report = await ctx.issuer.admin(ctx, async (tx) => {
      const existing = await this.service.getReportById(ctx, id, tx);
      if (!existing) throw new Error(`Report ${id} not found`);
      this.service.assertStatusTransition(existing.status, ReportStatus.REJECTED);
      return this.service.updateReportStatus(ctx, id, ReportStatus.REJECTED, undefined, tx);
    });
    return { __typename: "RejectReportSuccess", report: ReportPresenter.report(report) };
  }

  // =========================================================================
  // Batch operations
  // =========================================================================

  async refreshAllReportViews(ctx: IContext): Promise<void> {
    await ctx.issuer.internal((tx) => this.service.refreshTransactionSummaryDaily(ctx, tx));
    await ctx.issuer.internal((tx) => this.service.refreshUserTransactionDaily(ctx, tx));
  }
}

function clampInt(value: number, min: number, max: number, name: string): number {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be an integer, got ${value}`);
  }
  if (value < min || value > max) {
    throw new RangeError(`${name} must be between ${min} and ${max}, got ${value}`);
  }
  return value;
}
