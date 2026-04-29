import { bigintToSafeNumber } from "@/application/domain/report/util";
import {
  GqlAnalyticsCohortRetentionPoint,
  GqlAnalyticsCommunityAlerts,
  GqlAnalyticsCommunityPayload,
  GqlAnalyticsCommunitySummaryCard,
  GqlAnalyticsLatestCohort,
  GqlAnalyticsMemberList,
  GqlAnalyticsMemberRow,
  GqlAnalyticsMonthlyActivityPoint,
  GqlAnalyticsRetentionTrendPoint,
  GqlAnalyticsSegmentCounts,
  GqlAnalyticsStageBucket,
  GqlAnalyticsStageDistribution,
  GqlAnalyticsTenureDistribution,
  GqlAnalyticsWeeklyRetention,
  GqlAnalyticsWindowActivity,
} from "@/types/graphql";
import {
  AnalyticsAllTimeTotalsRow,
  AnalyticsChainDepthBucketRow,
  AnalyticsMemberStatsRow,
  AnalyticsMonthlyActivityRow,
} from "@/application/domain/analytics/community/data/type";
import {
  AlertFlags,
  LatestCohortCounts,
  WeeklyRetentionCounts,
  WindowActivityCounts,
} from "@/application/domain/analytics/community/service";
import {
  MonthlyCohortPoint,
  StageBreakdown,
  StageBucketStats,
  StageCounts,
  AnalyticsCohortFunnelPoint,
  TenureDistribution,
  WeeklyRetentionPoint,
} from "@/application/domain/analytics/community/aggregations";
import { MemberListResult } from "@/application/domain/analytics/community/pagination";

/**
 * Prisma / service rows → GraphQL payload shapes. Pure functions.
 *
 * BigInt → number conversions go through `bigintToSafeNumber` so values
 * beyond `Number.MAX_SAFE_INTEGER` throw loudly rather than silently
 * losing precision in the externally-reported totals.
 */
export default class AnalyticsCommunityPresenter {
  static segmentCounts(counts: StageCounts): GqlAnalyticsSegmentCounts {
    return {
      total: counts.total,
      tier1Count: counts.tier1Count,
      tier2Count: counts.tier2Count,
      activeCount: counts.activeCount,
      passiveCount: counts.passiveCount,
    };
  }

  static alerts(flags: AlertFlags): GqlAnalyticsCommunityAlerts {
    return {
      churnSpike: flags.churnSpike,
      activeDrop: flags.activeDrop,
      noNewMembers: flags.noNewMembers,
    };
  }

  static windowActivity(counts: WindowActivityCounts): GqlAnalyticsWindowActivity {
    return {
      senderCount: counts.senderCount,
      senderCountPrev: counts.senderCountPrev,
      newMemberCount: counts.newMemberCount,
      newMemberCountPrev: counts.newMemberCountPrev,
      retainedSenders: counts.retainedSenders,
    };
  }

  static weeklyRetention(counts: WeeklyRetentionCounts): GqlAnalyticsWeeklyRetention {
    return {
      retainedSenders: counts.retainedSenders,
      churnedSenders: counts.churnedSenders,
    };
  }

  static latestCohort(counts: LatestCohortCounts): GqlAnalyticsLatestCohort {
    return {
      size: counts.size,
      activeAtM1: counts.activeAtM1,
    };
  }

  static tenureDistribution(d: TenureDistribution): GqlAnalyticsTenureDistribution {
    return {
      lt1Month: d.lt1Month,
      m1to3Months: d.m1to3Months,
      m3to12Months: d.m3to12Months,
      gte12Months: d.gte12Months,
      // Histogram bucket shape happens to match the GraphQL type
      // 1:1 (monthsIn + count), so the array passes through
      // without per-element transformation.
      monthlyHistogram: d.monthlyHistogram,
    };
  }

  // --- L2 ----------------------------------------------------------------

  static summaryCard(params: {
    communityId: string;
    communityName: string;
    totalMembers: number;
    communityActivityRate: number;
    communityActivityRate3mAvg: number | null;
    growthRateActivity: number | null;
    tier2Count: number;
    allTimeTotals: AnalyticsAllTimeTotalsRow;
  }): GqlAnalyticsCommunitySummaryCard {
    const tier2Pct = params.totalMembers === 0 ? 0 : params.tier2Count / params.totalMembers;
    return {
      communityId: params.communityId,
      communityName: params.communityName,
      totalMembers: params.totalMembers,
      communityActivityRate: params.communityActivityRate,
      communityActivityRate3mAvg: params.communityActivityRate3mAvg,
      growthRateActivity: params.growthRateActivity,
      tier2Count: params.tier2Count,
      tier2Pct,
      totalDonationPointsAllTime: bigintToSafeNumber(params.allTimeTotals.totalDonationPoints),
      maxChainDepthAllTime: params.allTimeTotals.maxChainDepth,
      dataFrom: params.allTimeTotals.dataFrom,
      dataTo: params.allTimeTotals.dataTo,
    };
  }

  private static stageBucket(b: StageBucketStats): GqlAnalyticsStageBucket {
    return {
      count: b.count,
      pct: b.pct,
      pointsContributionPct: b.pointsContributionPct,
      avgSendRate: b.avgSendRate,
      avgMonthsIn: b.avgMonthsIn,
    };
  }

  static stages(breakdown: StageBreakdown): GqlAnalyticsStageDistribution {
    return {
      habitual: AnalyticsCommunityPresenter.stageBucket(breakdown.habitual),
      regular: AnalyticsCommunityPresenter.stageBucket(breakdown.regular),
      occasional: AnalyticsCommunityPresenter.stageBucket(breakdown.occasional),
      // The latent bucket's pointsContributionPct is always 0 by
      // definition (latent ≡ never-donated). summarize() already
      // computes 0 because `sumPointsOut` is 0 for latent rows.
      latent: AnalyticsCommunityPresenter.stageBucket(breakdown.latent),
    };
  }

  static monthlyActivityPoint(row: AnalyticsMonthlyActivityRow): GqlAnalyticsMonthlyActivityPoint {
    const rate =
      row.totalMembersEndOfMonth === 0 ? 0 : row.senderCount / row.totalMembersEndOfMonth;
    // Route both sides of chainPct through bigintToSafeNumber so an
    // extreme community's tx-count sums surface as a RangeError
    // instead of silently truncating to Number. The ratio itself is
    // a small [0, 1] fraction regardless of cumulative counts.
    const donationTxCount = bigintToSafeNumber(row.donationTxCount);
    const donationChainTxCount = bigintToSafeNumber(row.donationChainTxCount);
    const chainPct =
      donationTxCount === 0 ? null : donationChainTxCount / donationTxCount;
    return {
      month: row.monthStart,
      senderCount: row.senderCount,
      communityActivityRate: rate,
      newMembers: row.newMembers,
      donationPointsSum: bigintToSafeNumber(row.donationPointsSum),
      chainPct,
      // Pass-throughs from the repository row. `returnedMembers` is
      // already nullable on the row (= null for the first month in
      // the series); `dormantCountEndOfMonth` is always a
      // non-negative count. `hubMemberCount` is non-null on the row
      // (repository COALESCEs to 0); the GraphQL field is declared
      // nullable for forward compatibility but the presenter passes
      // the integer through verbatim.
      dormantCount: row.dormantCountEndOfMonth,
      returnedMembers: row.returnedMembers,
      hubMemberCount: row.hubMemberCount,
    };
  }

  static retentionTrendPoint(point: WeeklyRetentionPoint): GqlAnalyticsRetentionTrendPoint {
    return {
      week: point.weekStart,
      retainedSenders: point.retainedSenders,
      churnedSenders: point.churnedSenders,
      returnedSenders: point.returnedSenders,
      newMembers: point.newMembers,
      communityActivityRate: point.communityActivityRate,
    };
  }

  static cohortPoint(point: MonthlyCohortPoint): GqlAnalyticsCohortRetentionPoint {
    return {
      cohortMonth: point.cohortMonthStart,
      cohortSize: point.cohortSize,
      retentionM1: point.retentionM1,
      retentionM3: point.retentionM3,
      retentionM6: point.retentionM6,
    };
  }

  static memberRow(row: AnalyticsMemberStatsRow): GqlAnalyticsMemberRow {
    return {
      userId: row.userId,
      name: row.name,
      userSendRate: row.userSendRate,
      monthsIn: row.monthsIn,
      donationOutMonths: row.donationOutMonths,
      totalPointsOut: bigintToSafeNumber(row.totalPointsOut),
      uniqueDonationRecipients: row.uniqueDonationRecipients,
      daysIn: row.daysIn,
      donationOutDays: row.donationOutDays,
      // Receiver-side counterparts route through bigintToSafeNumber
      // for the same reason as totalPointsOut: cumulative
      // points-in for a community lifetime can exceed Int32 long
      // before they touch Number.MAX_SAFE_INTEGER, but we still
      // want loud overflow rather than silent precision loss in
      // the externally-reported totals.
      totalPointsIn: bigintToSafeNumber(row.totalPointsIn),
      donationInMonths: row.donationInMonths,
      donationInDays: row.donationInDays,
      uniqueDonationSenders: row.uniqueDonationSenders,
      // lastDonationDay is already a JST-midnight Date on the row
      // (see findMemberStats); rename to the public-facing
      // `lastDonationAt` here. null pass-through for never-donated
      // members.
      lastDonationAt: row.lastDonationDay,
    };
  }

  static memberList(result: MemberListResult): GqlAnalyticsMemberList {
    return {
      users: result.users.map(AnalyticsCommunityPresenter.memberRow),
      hasNextPage: result.hasNextPage,
      // Internal `nextOffset: number | null` → GraphQL
      // `nextCursor: String | null`. The encode lives here so the
      // service stays free of wire-format concerns; the matching
      // decode is in `AnalyticsCommunityConverter.parseMemberListCursor`.
      nextCursor:
        result.nextOffset !== null
          ? encodeMemberListCursor(result.nextOffset)
          : null,
    };
  }

  static communityDetail(params: {
    communityId: string;
    communityName: string;
    asOf: Date;
    windowMonths: number;
    summary: GqlAnalyticsCommunitySummaryCard;
    stages: GqlAnalyticsStageDistribution;
    monthlyActivityTrend: GqlAnalyticsMonthlyActivityPoint[];
    retentionTrend: GqlAnalyticsRetentionTrendPoint[];
    cohortRetention: GqlAnalyticsCohortRetentionPoint[];
    memberList: GqlAnalyticsMemberList;
    alerts: GqlAnalyticsCommunityAlerts;
    dormantCount: number;
    chainDepthDistribution: AnalyticsChainDepthBucketRow[];
    cohortFunnel: AnalyticsCohortFunnelPoint[];
  }): GqlAnalyticsCommunityPayload {
    return {
      communityId: params.communityId,
      communityName: params.communityName,
      asOf: params.asOf,
      windowMonths: params.windowMonths,
      summary: params.summary,
      stages: params.stages,
      monthlyActivityTrend: params.monthlyActivityTrend,
      retentionTrend: params.retentionTrend,
      cohortRetention: params.cohortRetention,
      memberList: params.memberList,
      alerts: params.alerts,
      dormantCount: params.dormantCount,
      // Chain-depth bucket shape (depth + count) matches the
      // GraphQL type 1:1 so the array passes through without
      // per-element transformation.
      chainDepthDistribution: params.chainDepthDistribution,
      // Same passthrough pattern: the cohort funnel point shape
      // (cohortMonth + 4 stage counts) matches the GraphQL type
      // 1:1.
      cohortFunnel: params.cohortFunnel,
    };
  }
}

/**
 * Internal offset → GraphQL `nextCursor` wire format. Base64 of the
 * offset's stringified form, matching the prior in-service helper.
 * Exported so the round-trip unit test can assert encode/decode
 * symmetry against `AnalyticsCommunityConverter.parseMemberListCursor` without
 * exercising the full member-list presenter.
 */
export function encodeMemberListCursor(offset: number): string {
  return Buffer.from(String(offset), "utf8").toString("base64");
}
