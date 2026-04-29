import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  CohortRetentionRow,
  CommunityContextRow,
  DateRange,
  DeepestChainRow,
  PeriodAggregateRow,
  RetentionAggregateRow,
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/transactionStats/data/rows";

/**
 * Transaction-statistics repository contract for the report domain.
 * Aggregations + materialized-view refreshes are scoped here so callers
 * (ReportService.weeklyPayload, sysadmin retention/cohort orchestrators)
 * can ask for a single concern without dragging the entity / template
 * surface around.
 */
export interface IReportTransactionStatsRepository {
  findDailySummaries(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionSummaryDailyRow[]>;
  findDailyActiveUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionActiveUsersDailyRow[]>;
  findTopUsersByTotalPoints(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    topN: number,
  ): Promise<UserTransactionAggregateRow[]>;
  findTrueUniqueCounterpartiesForUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    userIds: string[],
  ): Promise<Map<string, number>>;
  findCommentsByDateRange(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    limit?: number,
  ): Promise<TransactionCommentRow[]>;
  findUserProfiles(
    ctx: IContext,
    communityId: string,
    userIds: string[],
  ): Promise<UserProfileForReportRow[]>;
  findCommunityContext(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<CommunityContextRow | null>;
  findDeepestChain(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<DeepestChainRow | null>;
  findPeriodAggregate(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<PeriodAggregateRow>;
  findRetentionAggregate(
    ctx: IContext,
    communityId: string,
    range: {
      currentWeekStart: Date;
      nextWeekStart: Date;
      prevWeekStart: Date;
      twelveWeeksAgo: Date;
    },
  ): Promise<RetentionAggregateRow>;
  /**
   * Bulk variant of `findRetentionAggregate`. Computes the same six
   * counters for every community in `communityIds` in a single SQL
   * roundtrip; returns one entry per requested community
   * (zero-row defaults for communities with no rows in the window).
   */
  findRetentionAggregateBulk(
    ctx: IContext,
    communityIds: string[],
    range: {
      currentWeekStart: Date;
      nextWeekStart: Date;
      prevWeekStart: Date;
      twelveWeeksAgo: Date;
    },
  ): Promise<Map<string, RetentionAggregateRow>>;
  findCohortRetention(
    ctx: IContext,
    communityId: string,
    cohort: { cohortStart: Date; cohortEnd: Date },
    active: { activeStart: Date; activeEnd: Date },
  ): Promise<CohortRetentionRow>;
  /**
   * Bulk variant of `findCohortRetention`. Computes cohort-size and
   * active-next-week per community in a single SQL roundtrip.
   */
  findCohortRetentionBulk(
    ctx: IContext,
    communityIds: string[],
    cohort: { cohortStart: Date; cohortEnd: Date },
    active: { activeStart: Date; activeEnd: Date },
  ): Promise<Map<string, CohortRetentionRow>>;
  refreshTransactionSummaryDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void>;
  refreshUserTransactionDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void>;
}
