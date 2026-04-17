import { ReportStatus } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { ValidationError } from "@/errors/graphql";
import ReportService from "@/application/domain/report/service";
import ReportPresenter, { WeeklyReportPayload } from "@/application/domain/report/presenter";
import { addDays, daysBetweenJst, truncateToJstDate } from "@/application/domain/report/util";
import { renderPromptTemplate } from "@/application/domain/report/util/promptRenderer";
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

const LLM_TIMEOUT_MS = 120_000;
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
      let parentRegenerateCount = 0;
      if (input.parentRunId) {
        const parent = await this.service.getReportById(ctx, input.parentRunId, tx);
        if (!parent) throw new Error(`Parent report ${input.parentRunId} not found`);
        if (parent.communityId !== communityId || parent.variant !== input.variant) {
          throw new Error("Parent report must belong to the same community and variant");
        }
        parentRegenerateCount = parent.regenerateCount;
        if (parent.status !== ReportStatus.SUPERSEDED) {
          this.service.assertStatusTransition(parent.status, ReportStatus.SUPERSEDED);
          await this.service.updateReportStatus(
            ctx,
            input.parentRunId,
            ReportStatus.SUPERSEDED,
            undefined,
            tx,
          );
        }
      }

      return this.service.createReport(
        ctx,
        {
          communityId,
          variant: input.variant,
          periodFrom,
          periodTo,
          templateId: template.id,
          inputPayload: payload as object,
          outputMarkdown: llmResult.text,
          model: llmResult.model,
          systemPromptSnapshot: template.systemPrompt,
          userPromptSnapshot: userPrompt,
          communityContextSnapshot: template.communityContext,
          inputTokens: llmResult.usage.inputTokens,
          outputTokens: llmResult.usage.outputTokens,
          cacheReadTokens: llmResult.usage.cacheReadTokens,
          ...(input.parentRunId && {
            parentRunId: input.parentRunId,
            regenerateCount: parentRegenerateCount + 1,
          }),
          ...(ctx.currentUser && { generatedBy: ctx.currentUser.id }),
        },
        tx,
      );
    });

    return { __typename: "GenerateReportSuccess", report: ReportPresenter.report(report) };
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
