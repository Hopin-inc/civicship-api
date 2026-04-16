import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import ReportService from "@/application/domain/report/service";
import ReportPresenter, {
  WeeklyReportPayload,
} from "@/application/domain/report/presenter";
import { addDays, truncateToJstDate } from "@/application/domain/report/util";

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
    const windowDays = params.windowDays ?? 7;
    const to = truncateToJstDate(params.referenceDate);
    const from = addDays(to, -(windowDays - 1));
    const range = { from, to };

    const [summaries, activeUsers, userTransactions, comments] = await Promise.all([
      this.service.getDailySummaries(ctx, params.communityId, range),
      this.service.getDailyActiveUsers(ctx, params.communityId, range),
      this.service.getDailyUserTransactions(ctx, params.communityId, range),
      this.service.getComments(ctx, params.communityId, range, params.commentLimit),
    ]);

    const userIds = Array.from(new Set(userTransactions.map((u) => u.userId)));
    const profiles = await this.service.getUserProfiles(
      ctx,
      params.communityId,
      userIds,
    );

    return ReportPresenter.weeklyPayload({
      communityId: params.communityId,
      range,
      referenceDate: to,
      summaries,
      activeUsers,
      userTransactions,
      profiles,
      comments,
      topN: params.topN,
    });
  }

  /**
   * Refresh all three materialized views. Called from the daily batch.
   *
   * Each refresh runs in its own bypass-RLS transaction (per CLAUDE.md:
   * transactions are managed at the UseCase layer, not the Service layer).
   * They are sequential rather than parallel to keep DB load predictable
   * during the nightly window.
   */
  async refreshAllReportViews(ctx: IContext): Promise<void> {
    await ctx.issuer.internal((tx) =>
      this.service.refreshTransactionSummaryDaily(ctx, tx),
    );
    await ctx.issuer.internal((tx) =>
      this.service.refreshTransactionActiveUsersDaily(ctx, tx),
    );
    await ctx.issuer.internal((tx) =>
      this.service.refreshUserTransactionDaily(ctx, tx),
    );
  }
}
