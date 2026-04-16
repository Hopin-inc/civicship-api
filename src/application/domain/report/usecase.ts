import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import ReportService from "@/application/domain/report/service";
import ReportPresenter, { WeeklyReportPayload } from "@/application/domain/report/presenter";
import { addDays, truncateToJstDate } from "@/application/domain/report/util";

const DEFAULT_WINDOW_DAYS = 7;
const DEFAULT_TOP_N = 10;
const DEFAULT_COMMENT_LIMIT = 200;
const MAX_WINDOW_DAYS = 90;
const MAX_TOP_N = 100;
const MAX_COMMENT_LIMIT = 1000;

@injectable()
export default class ReportUseCase {
  constructor(@inject("ReportService") private readonly service: ReportService) {}

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
