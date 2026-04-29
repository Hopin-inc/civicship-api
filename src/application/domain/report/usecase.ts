import { Prisma, ReportStatus, ReportTemplateKind } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { ValidationError } from "@/errors/graphql";
import ReportService from "@/application/domain/report/service";
import ReportJudgeService, { JudgeParseError } from "@/application/domain/report/template/judgeService";
import ReportTemplateSelector from "@/application/domain/report/template/selector";
import ReportPresenter from "@/application/domain/report/presenter";
import { WeeklyReportPayload } from "@/application/domain/report/types";
import {
  addDays,
  daysBetweenJst,
  isoWeekStartJst,
  truncateToJstDate,
} from "@/application/domain/report/util";
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
  GqlAdminReportSummaryConnection,
  GqlMutationGenerateReportArgs,
  GqlMutationUpdateReportTemplateArgs,
  GqlMutationApproveReportArgs,
  GqlMutationPublishReportArgs,
  GqlMutationRejectReportArgs,
  GqlQueryReportsArgs,
  GqlQueryReportArgs,
  GqlQueryReportTemplateArgs,
  GqlQueryReportTemplatesArgs,
  GqlQueryReportsAllArgs,
  GqlQueryReportSummariesArgs,
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
    @inject("ReportTemplateSelector") private readonly templateSelector: ReportTemplateSelector,
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
      /**
       * When true, run a second aggregate pass over the equal-length window
       * immediately preceding `[from, to]` and attach it (plus growth-rate
       * math) as `previous_period` on the payload. Defaults to `false` so
       * today's callers — the generation mutation and the batch refresh —
       * keep their current single-window behaviour until a prompt template
       * is updated to consume the new block.
       */
      includePreviousPeriod?: boolean;
      /**
       * When true, compute retention / cohort counters and attach them as
       * `retention` on the payload. Defaults to `false` so today's callers
       * keep their current behaviour until a prompt template is ready to
       * consume the block.
       *
       * The retention frame is always the ISO week (Monday 00:00 JST –
       * next Monday 00:00 JST) that `referenceDate` falls in, independent
       * of `windowDays`. Retention is a weekly semantic; using the report
       * window length here would make week1 / week4 cohort boundaries
       * drift away from the SQL bucketing in `v_user_cohort`.
       */
      includeRetention?: boolean;
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

    const previousRange = params.includePreviousPeriod
      ? { from: addDays(from, -windowDays), to: addDays(from, -1) }
      : null;

    // Retention is anchored to the ISO week (Monday 00:00 JST) that
    // `referenceDate` falls in — not a rolling 7-day window ending at `to`.
    // `isoWeekStartJst` mirrors the SQL `DATE_TRUNC('week', ...)` bucketing
    // used by `v_user_cohort`, so week1 / week4 cohort boundaries computed
    // here match the SQL-side buckets exactly. Retention is a weekly
    // semantic, independent of the (possibly-shorter-or-longer) report
    // window length.
    const retentionRange = params.includeRetention
      ? (() => {
          const currentWeekStart = isoWeekStartJst(params.referenceDate);
          const nextWeekStart = addDays(currentWeekStart, 7);
          const prevWeekStart = addDays(currentWeekStart, -7);
          // 12 weeks of lookback ending at prevWeekStart (exclusive), so
          // the range `[twelveWeeksAgo, prevWeekStart)` has 12 full weeks.
          // Was -7*11 (only 11 weeks); returned_senders was shifted by one
          // week and silently under-counted people who returned after a
          // 12-week absence.
          const twelveWeeksAgo = addDays(prevWeekStart, -7 * 12);
          return { nextWeekStart, currentWeekStart, prevWeekStart, twelveWeeksAgo };
        })()
      : null;

    const [
      summaries,
      activeUsers,
      topUserAggregates,
      comments,
      communityContext,
      deepestChain,
      previousAggregate,
      retentionAggregate,
      week1Cohort,
      week4Cohort,
    ] = await Promise.all([
      this.service.getDailySummaries(ctx, params.communityId, range),
      this.service.getDailyActiveUsers(ctx, params.communityId, range),
      this.service.getTopUsersByTotalPoints(ctx, params.communityId, range, topN),
      this.service.getComments(ctx, params.communityId, range, commentLimit),
      this.service.getCommunityContext(ctx, params.communityId, range),
      this.service.getDeepestChain(ctx, params.communityId, range),
      previousRange
        ? this.service.getPeriodAggregate(ctx, params.communityId, previousRange)
        : Promise.resolve(null),
      retentionRange
        ? this.service.getRetentionAggregate(ctx, params.communityId, retentionRange)
        : Promise.resolve(null),
      retentionRange
        ? this.service.getCohortRetention(
            ctx,
            params.communityId,
            {
              // Week-1 retention: cohort that joined 1 week before
              // currentWeekStart, measured against currentWeek activity.
              cohortStart: addDays(retentionRange.currentWeekStart, -7),
              cohortEnd: retentionRange.currentWeekStart,
            },
            {
              activeStart: retentionRange.currentWeekStart,
              activeEnd: retentionRange.nextWeekStart,
            },
          )
        : Promise.resolve(null),
      retentionRange
        ? this.service.getCohortRetention(
            ctx,
            params.communityId,
            {
              // Week-4 retention: cohort joined 4 weeks before
              // currentWeekStart, measured against currentWeek activity.
              cohortStart: addDays(retentionRange.currentWeekStart, -7 * 4),
              cohortEnd: addDays(retentionRange.currentWeekStart, -7 * 3),
            },
            {
              activeStart: retentionRange.currentWeekStart,
              activeEnd: retentionRange.nextWeekStart,
            },
          )
        : Promise.resolve(null),
    ]);

    const userIds = topUserAggregates.map((u) => u.userId);
    // Profiles and the true-counterparty lookup both fan out over the
    // top-N ids we already selected, so issue them in parallel — no
    // dependency between them and neither blocks the payload build.
    const [profiles, trueUniqueCounterparties] = await Promise.all([
      this.service.getUserProfiles(ctx, params.communityId, userIds),
      this.service.getTrueUniqueCounterpartiesForUsers(ctx, params.communityId, range, userIds),
    ]);

    // Current-window counters come from the data we already fetched so we
    // don't re-scan the MVs for numbers the payload already exposes.
    // `total_tx_count` / `total_points_sum` sum across reason buckets — the
    // presenter is deliberately given raw rows, not a pre-reduced number,
    // so growth-rate math stays in the pure presentation layer.
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
      trueUniqueCounterparties,
      previousPeriod: previousAggregate
        ? { range: previousRange!, aggregate: previousAggregate }
        : null,
      // `retention` is gated purely on whether the caller opted in (i.e.
      // `retentionAggregate` is non-null). Do NOT additionally gate on
      // `communityContext` — that would silently null out the whole block
      // whenever the community row is missing / soft-deleted, which breaks
      // the `includeRetention` opt-in contract. When `communityContext` is
      // null we surface `totalMembers: null` and the presenter collapses
      // only the derived rates to null; the raw counters still flow
      // through so the block stays useful.
      retention: retentionAggregate
        ? {
            aggregate: retentionAggregate,
            totalMembers: communityContext?.totalMembers ?? null,
            week1: week1Cohort,
            week4: week4Cohort,
          }
        : null,
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

    // Select the generation template via the A/B-aware selector. The
    // reference date is `periodTo`, which — combined with the selector's
    // `${communityId}-${isoWeekStartJst}` seed — pins a regenerate within
    // the same ISO week to the same template as the original run.
    const template = await this.templateSelector.selectTemplate(
      ctx,
      input.variant,
      ReportTemplateKind.GENERATION,
      communityId,
      periodTo,
    );
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
    // halt. The outer try/catch additionally protects against the DB
    // write inside judgeAndPersist itself failing (connection blip,
    // tx timeout in onlyBelongingCommunity); without it, a successful
    // generation would surface as a mutation error and the user would
    // retry, creating a duplicate. The persisted row is always
    // returned even if every observability persist attempt fails.
    let judgedReport = report;
    try {
      judgedReport = await this.judgeAndPersist(ctx, report, payload, llmResult.text);
    } catch (e) {
      console.warn(
        JSON.stringify({
          event: "report.judge.failed",
          reason: "persist_failure",
          reportId: report.id,
          variant: report.variant,
          message: (e as Error).message,
        }),
      );
    }

    return { __typename: "GenerateReportSuccess", report: ReportPresenter.report(judgedReport) };
  }

  /**
   * Best-effort judge run. Persists `coverageJson` on every path
   * (the substring analysis is pure and cheap), and additionally
   * persists `judgeScore` / `judgeBreakdown` on the success path.
   *
   * Failure modes are logged as structured JSON with a `reason` field
   * so observability can route the buckets independently:
   *   - template_config_error: COMMUNITY-scope JUDGE seed slipped past
   *     the guard. Config bug; alert.
   *   - parse_failure: judge prompt producing output the parser can't
   *     consume. Prompt-quality regression; alert.
   *   - llm_failure: transient (network / 5xx / abort); retry-friendly.
   * Note: PII is never logged — JudgeParseError exposes only
   * `responseLength`, never the raw judge output that could echo
   * report content.
   *
   * Throws to the caller only if the coverage save itself fails
   * (DB outage); the caller wraps in try/catch and returns the
   * pre-judge row, preserving the documented "generateReport always
   * returns the persisted row" contract.
   */
  private async judgeAndPersist(
    ctx: IContext,
    report: Awaited<ReturnType<ReportService["createReport"]>>,
    payload: WeeklyReportPayload,
    outputMarkdown: string,
  ) {
    // Computed up-front (pure, no side effects) so every persist path
    // below has the value available — including the
    // template_config_error catch arm where we still want the cheap
    // coverage signal recorded.
    const coverage = analyzeCoverage(payload, outputMarkdown);

    let judgeTemplate;
    try {
      judgeTemplate = await this.judgeService.selectJudgeTemplate(ctx, report.variant);
    } catch (e) {
      console.warn(
        JSON.stringify({
          event: "report.judge.failed",
          reason: "template_config_error",
          reportId: report.id,
          variant: report.variant,
          message: (e as Error).message,
        }),
      );
      return this.persistJudgeOutcome(ctx, report.id, {
        judgeScore: null,
        judgeBreakdown: null,
        judgeTemplateId: null,
        coverageJson: coverage as unknown as Prisma.InputJsonValue,
      });
    }

    if (!judgeTemplate) {
      // No judge wired up for this variant yet — persist coverage on
      // its own so the field is not perpetually null for variants that
      // never get a judge prompt.
      return this.persistJudgeOutcome(ctx, report.id, {
        judgeScore: null,
        judgeBreakdown: null,
        judgeTemplateId: null,
        coverageJson: coverage as unknown as Prisma.InputJsonValue,
      });
    }

    let judgeResult;
    try {
      judgeResult = await this.judgeService.executeJudge(ctx, judgeTemplate, {
        outputMarkdown,
        inputPayload: payload,
      });
    } catch (e) {
      const isParseError = e instanceof JudgeParseError;
      const logPayload = {
        event: "report.judge.failed",
        reason: isParseError ? "parse_failure" : "llm_failure",
        reportId: report.id,
        variant: report.variant,
        judgeTemplateId: judgeTemplate.id,
        message: (e as Error).message,
        // PII-safe diagnostic: length only. The raw judge output may
        // echo user-generated report content (member names, comments)
        // and we deliberately do not propagate it to the log stream.
        ...(isParseError && {
          responseLength: (e as JudgeParseError).responseLength,
        }),
      };
      console.warn(JSON.stringify(logPayload));
      return this.persistJudgeOutcome(ctx, report.id, {
        judgeScore: null,
        judgeBreakdown: null,
        judgeTemplateId: judgeTemplate.id,
        coverageJson: coverage as unknown as Prisma.InputJsonValue,
      });
    }

    return this.persistJudgeOutcome(ctx, report.id, {
      judgeScore: judgeResult.score,
      judgeBreakdown: judgeResult as unknown as Prisma.InputJsonValue,
      judgeTemplateId: judgeTemplate.id,
      coverageJson: coverage as unknown as Prisma.InputJsonValue,
    });
  }

  /**
   * Single seam for persisting the judge / coverage columns on a
   * Report row, used by every branch of `judgeAndPersist`. Wrapping
   * the `onlyBelongingCommunity` issuer call here avoids repeating the
   * three-line transaction boilerplate at each callsite and gives the
   * caller a single line to wrap when adding new judge columns later.
   */
  private async persistJudgeOutcome(
    ctx: IContext,
    reportId: string,
    data: {
      judgeScore: number | null;
      judgeBreakdown: Prisma.InputJsonValue | null;
      judgeTemplateId: string | null;
      coverageJson: Prisma.InputJsonValue | null;
    },
  ) {
    return ctx.issuer.onlyBelongingCommunity(ctx, (tx) =>
      this.service.saveJudgeResult(ctx, reportId, data, tx),
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
      // A-3: capture whether the parent was PUBLISHED *before* we
      // transition it. The recalc only matters when the row being
      // superseded was actually the (or a) PUBLISHED row pointed at
      // by `t_communities.last_published_report_id`; for DRAFT /
      // APPROVED / SKIPPED parents the pointer was never on this
      // row and recompute would be a no-op, so we skip the extra
      // query.
      const wasPublished = parent.status === ReportStatus.PUBLISHED;
      this.service.assertStatusTransition(parent.status, ReportStatus.SUPERSEDED);
      await this.service.updateReportStatus(
        ctx,
        parentRunId,
        ReportStatus.SUPERSEDED,
        undefined,
        tx,
      );
      if (wasPublished) {
        await this.service.recalculateCommunityLastPublished(ctx, communityId, tx);
      }
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

  /**
   * Phase 1 admin: list multiple template revisions for the
   * management UI. The schema default is `kind: GENERATION`, which
   * GraphQL applies when the arg is omitted; `null` only reaches us
   * when the caller sends it explicitly or the usecase is invoked
   * directly (e.g. from tests) without going through the schema
   * default. Codegen also types every arg as nullable, so coalesce
   * here to guarantee the service layer sees a concrete kind.
   */
  async listReportTemplates(
    { variant, communityId, kind, includeInactive }: GqlQueryReportTemplatesArgs,
    ctx: IContext,
  ): Promise<GqlReportTemplate[]> {
    const templates = await this.service.listTemplates(
      ctx,
      variant,
      communityId ?? null,
      kind ?? ReportTemplateKind.GENERATION,
      includeInactive ?? false,
    );
    return templates.map(ReportPresenter.reportTemplate);
  }

  async updateReportTemplate(
    { communityId, variant, input }: GqlMutationUpdateReportTemplateArgs,
    ctx: IContext,
  ): Promise<GqlUpdateReportTemplatePayload> {
    // App-layer bounds check on trafficWeight. The DB already enforces the
    // same invariant via `t_report_templates_traffic_weight_check`, but a
    // CHECK-constraint violation surfaces as an opaque
    // PrismaClientKnownRequestError — we want the admin UI to see a
    // structured ValidationError with an attribution to the offending
    // field instead.
    if (input.trafficWeight !== undefined && input.trafficWeight !== null) {
      if (
        !Number.isInteger(input.trafficWeight) ||
        input.trafficWeight < 0 ||
        input.trafficWeight > 100
      ) {
        throw new ValidationError("trafficWeight must be an integer between 0 and 100", [
          "trafficWeight",
        ]);
      }
    }

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
      const updated = await this.service.updateReportStatus(
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
      // A-3: keep the per-community last-publish pointer
      // (`t_communities.last_published_report_*`) in sync inside the
      // same transaction. `adminReportSummary` reads from those
      // columns, so a publish without recalc would surface a stale
      // pointer until the next maintenance call. Always re-derives
      // from `t_reports`, so re-running is a no-op.
      await this.service.recalculateCommunityLastPublished(ctx, updated.communityId, tx);
      return updated;
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

  /**
   * Phase 2 sysAdmin: cross-community report search. The IsAdmin
   * directive on the GraphQL query is the only authz gate (no
   * permission.communityId hand-off) — the usecase trusts the
   * directive and does not re-check sysRole.
   */
  async browseAllReports(
    args: GqlQueryReportsAllArgs,
    ctx: IContext,
  ): Promise<GqlReportsConnection> {
    const first = args.first
      ? validateIntInRange(args.first, 1, MAX_REPORTS_PER_PAGE, "first")
      : DEFAULT_REPORTS_PER_PAGE;
    const result = await this.service.getAllReports(ctx, {
      communityId: args.communityId ?? undefined,
      status: args.status ?? undefined,
      variant: args.variant ?? undefined,
      publishedAfter: args.publishedAfter ? new Date(args.publishedAfter) : undefined,
      publishedBefore: args.publishedBefore ? new Date(args.publishedBefore) : undefined,
      cursor: args.cursor ?? undefined,
      first,
    });
    return ReportPresenter.reportsConnection(result.items, result.totalCount, first);
  }

  /**
   * Phase 2 sysAdmin: per-community last-publish summary for the L1
   * dashboard. Returns an `AdminReportSummaryConnection` whose nodes
   * carry the denormalized pointer + 90-day publish count; the
   * resolver hydrates `community` / `lastPublishedReport` via the
   * existing dataloaders.
   */
  async viewReportSummaries(
    args: GqlQueryReportSummariesArgs,
    ctx: IContext,
  ): Promise<GqlAdminReportSummaryConnection> {
    const first = args.first
      ? validateIntInRange(args.first, 1, MAX_REPORTS_PER_PAGE, "first")
      : DEFAULT_REPORTS_PER_PAGE;
    const result = await this.service.getCommunityReportSummary(ctx, {
      cursor: args.cursor ?? undefined,
      first,
    });
    return ReportPresenter.adminReportSummaryConnection(
      result.items,
      result.totalCount,
      first,
    );
  }

  // =========================================================================
  // Batch operations
  // =========================================================================

  async refreshAllReportViews(ctx: IContext): Promise<void> {
    await ctx.issuer.internal((tx) => this.service.refreshTransactionSummaryDaily(ctx, tx));
    await ctx.issuer.internal((tx) => this.service.refreshUserTransactionDaily(ctx, tx));
    await ctx.issuer.internal((tx) => this.service.refreshDonationTxEdges(ctx, tx));
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

/**
 * Mirror of `feedback/usecase.ts`'s `validateInt` so the admin-query
 * paths in this file (`browseAllReports`, `viewReportSummaries`)
 * surface a `ValidationError` instead of `clampInt`'s `RangeError` —
 * `ValidationError` is what the GraphQL error mapper translates into a
 * client-facing `ValidationError` extension. Existing `clampInt`
 * call sites (buildReportPayload's window/topN/commentLimit and the
 * legacy `browseReports`) keep their current behaviour to avoid
 * widening this PR's scope into a domain-wide refactor.
 */
function validateIntInRange(
  value: number,
  min: number,
  max: number,
  name: string,
): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ValidationError(
      `${name} must be an integer between ${min} and ${max}, got ${value}`,
      [name],
    );
  }
  return value;
}
