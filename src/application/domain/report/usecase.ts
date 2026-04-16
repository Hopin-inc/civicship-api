import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import ReportService from "@/application/domain/report/service";
import ReportPresenter, {
  WeeklyReportPayload,
} from "@/application/domain/report/presenter";

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
   */
  async refreshAllReportViews(ctx: IContext): Promise<void> {
    await this.service.refreshAllReportViews(ctx);
  }
}

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Truncate a Date to the start of its Asia/Tokyo calendar day, returning a
 * Date whose UTC components encode that JST date at UTC 00:00.
 *
 * The materialized views bucket dates with `AT TIME ZONE 'Asia/Tokyo'` into
 * `@db.Date` columns. Prisma serializes Date values without timezone info for
 * `@db.Date`, so passing a UTC-midnight Date whose year/month/day match the
 * intended JST calendar date is what lines up the filter with the MV.
 *
 * Using naive `setUTCHours(0,0,0,0)` would cause an off-by-one during
 * 00:00–08:59 JST (= 15:00–23:59 UTC previous day).
 */
function truncateToJstDate(d: Date): Date {
  const jst = new Date(d.getTime() + JST_OFFSET_MS);
  return new Date(
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()),
  );
}

function addDays(d: Date, days: number): Date {
  const t = new Date(d);
  t.setUTCDate(t.getUTCDate() + days);
  return t;
}
