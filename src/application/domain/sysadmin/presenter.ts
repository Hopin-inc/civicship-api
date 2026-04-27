import { bigintToSafeNumber } from "@/application/domain/report/util";
import {
  GqlSysAdminCohortRetentionPoint,
  GqlSysAdminCommunityAlerts,
  GqlSysAdminCommunityDetailPayload,
  GqlSysAdminCommunityOverview,
  GqlSysAdminCommunitySummaryCard,
  GqlSysAdminDashboardPayload,
  GqlSysAdminLatestCohort,
  GqlSysAdminMemberList,
  GqlSysAdminMemberRow,
  GqlSysAdminMonthlyActivityPoint,
  GqlSysAdminPlatformSummary,
  GqlSysAdminRetentionTrendPoint,
  GqlSysAdminSegmentCounts,
  GqlSysAdminStageBucket,
  GqlSysAdminStageDistribution,
  GqlSysAdminTenureDistribution,
  GqlSysAdminWeeklyRetention,
  GqlSysAdminWindowActivity,
} from "@/types/graphql";
import {
  SysAdminAllTimeTotalsRow,
  SysAdminMemberStatsRow,
  SysAdminMonthlyActivityRow,
  SysAdminPlatformTotalsRow,
} from "@/application/domain/sysadmin/data/type";
import {
  AlertFlags,
  LatestCohortCounts,
  MemberListResult,
  MonthlyCohortPoint,
  StageBreakdown,
  StageBucketStats,
  StageCounts,
  TenureDistribution,
  WeeklyRetentionCounts,
  WeeklyRetentionPoint,
  WindowActivityCounts,
} from "@/application/domain/sysadmin/service";

/**
 * Prisma / service rows → GraphQL payload shapes. Pure functions.
 *
 * BigInt → number conversions go through `bigintToSafeNumber` so values
 * beyond `Number.MAX_SAFE_INTEGER` throw loudly rather than silently
 * losing precision in the externally-reported totals.
 */
export default class SysAdminPresenter {
  static platform(row: SysAdminPlatformTotalsRow): GqlSysAdminPlatformSummary {
    return {
      communitiesCount: row.communitiesCount,
      totalMembers: row.totalMembers,
      latestMonthDonationPoints: bigintToSafeNumber(row.latestMonthDonationPoints),
    };
  }

  static segmentCounts(counts: StageCounts): GqlSysAdminSegmentCounts {
    return {
      total: counts.total,
      tier1Count: counts.tier1Count,
      tier2Count: counts.tier2Count,
      activeCount: counts.activeCount,
      passiveCount: counts.passiveCount,
    };
  }

  static alerts(flags: AlertFlags): GqlSysAdminCommunityAlerts {
    return {
      churnSpike: flags.churnSpike,
      activeDrop: flags.activeDrop,
      noNewMembers: flags.noNewMembers,
    };
  }

  static windowActivity(counts: WindowActivityCounts): GqlSysAdminWindowActivity {
    return {
      senderCount: counts.senderCount,
      senderCountPrev: counts.senderCountPrev,
      newMemberCount: counts.newMemberCount,
      newMemberCountPrev: counts.newMemberCountPrev,
      retainedSenders: counts.retainedSenders,
    };
  }

  static weeklyRetention(counts: WeeklyRetentionCounts): GqlSysAdminWeeklyRetention {
    return {
      retainedSenders: counts.retainedSenders,
      churnedSenders: counts.churnedSenders,
    };
  }

  static latestCohort(counts: LatestCohortCounts): GqlSysAdminLatestCohort {
    return {
      size: counts.size,
      activeAtM1: counts.activeAtM1,
    };
  }

  static tenureDistribution(d: TenureDistribution): GqlSysAdminTenureDistribution {
    return {
      lt1Month: d.lt1Month,
      m1to3Months: d.m1to3Months,
      m3to12Months: d.m3to12Months,
      gte12Months: d.gte12Months,
    };
  }

  static overviewRow(params: {
    communityId: string;
    communityName: string;
    totalMembers: number;
    stageCounts: StageCounts;
    windowActivity: WindowActivityCounts;
    weeklyRetention: WeeklyRetentionCounts;
    latestCohort: LatestCohortCounts;
    hubMemberCount: number;
    tenureDistribution: TenureDistribution;
    dormantCount: number;
  }): GqlSysAdminCommunityOverview {
    return {
      communityId: params.communityId,
      communityName: params.communityName,
      totalMembers: params.totalMembers,
      segmentCounts: SysAdminPresenter.segmentCounts(params.stageCounts),
      windowActivity: SysAdminPresenter.windowActivity(params.windowActivity),
      weeklyRetention: SysAdminPresenter.weeklyRetention(params.weeklyRetention),
      latestCohort: SysAdminPresenter.latestCohort(params.latestCohort),
      hubMemberCount: params.hubMemberCount,
      tenureDistribution: SysAdminPresenter.tenureDistribution(params.tenureDistribution),
      dormantCount: params.dormantCount,
    };
  }

  static dashboard(params: {
    asOf: Date;
    platform: SysAdminPlatformTotalsRow;
    communities: GqlSysAdminCommunityOverview[];
  }): GqlSysAdminDashboardPayload {
    return {
      asOf: params.asOf,
      platform: SysAdminPresenter.platform(params.platform),
      communities: params.communities,
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
    allTimeTotals: SysAdminAllTimeTotalsRow;
  }): GqlSysAdminCommunitySummaryCard {
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

  private static stageBucket(b: StageBucketStats): GqlSysAdminStageBucket {
    return {
      count: b.count,
      pct: b.pct,
      pointsContributionPct: b.pointsContributionPct,
      avgSendRate: b.avgSendRate,
      avgMonthsIn: b.avgMonthsIn,
    };
  }

  static stages(breakdown: StageBreakdown): GqlSysAdminStageDistribution {
    return {
      habitual: SysAdminPresenter.stageBucket(breakdown.habitual),
      regular: SysAdminPresenter.stageBucket(breakdown.regular),
      occasional: SysAdminPresenter.stageBucket(breakdown.occasional),
      // The latent bucket's pointsContributionPct is always 0 by
      // definition (latent ≡ never-donated). summarize() already
      // computes 0 because `sumPointsOut` is 0 for latent rows.
      latent: SysAdminPresenter.stageBucket(breakdown.latent),
    };
  }

  static monthlyActivityPoint(row: SysAdminMonthlyActivityRow): GqlSysAdminMonthlyActivityPoint {
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

  static retentionTrendPoint(point: WeeklyRetentionPoint): GqlSysAdminRetentionTrendPoint {
    return {
      week: point.weekStart,
      retainedSenders: point.retainedSenders,
      churnedSenders: point.churnedSenders,
      returnedSenders: point.returnedSenders,
      newMembers: point.newMembers,
      communityActivityRate: point.communityActivityRate,
    };
  }

  static cohortPoint(point: MonthlyCohortPoint): GqlSysAdminCohortRetentionPoint {
    return {
      cohortMonth: point.cohortMonthStart,
      cohortSize: point.cohortSize,
      retentionM1: point.retentionM1,
      retentionM3: point.retentionM3,
      retentionM6: point.retentionM6,
    };
  }

  static memberRow(row: SysAdminMemberStatsRow): GqlSysAdminMemberRow {
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
    };
  }

  static memberList(result: MemberListResult): GqlSysAdminMemberList {
    return {
      users: result.users.map(SysAdminPresenter.memberRow),
      hasNextPage: result.hasNextPage,
      nextCursor: result.nextCursor,
    };
  }

  static communityDetail(params: {
    communityId: string;
    communityName: string;
    asOf: Date;
    windowMonths: number;
    summary: GqlSysAdminCommunitySummaryCard;
    stages: GqlSysAdminStageDistribution;
    monthlyActivityTrend: GqlSysAdminMonthlyActivityPoint[];
    retentionTrend: GqlSysAdminRetentionTrendPoint[];
    cohortRetention: GqlSysAdminCohortRetentionPoint[];
    memberList: GqlSysAdminMemberList;
    alerts: GqlSysAdminCommunityAlerts;
    dormantCount: number;
  }): GqlSysAdminCommunityDetailPayload {
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
    };
  }
}
