import {
  GqlAnalyticsCommunityOverview,
  GqlAnalyticsDashboardPayload,
} from "@/types/graphql";
import {
  StageCounts,
  TenureDistribution,
} from "@/application/domain/analytics/community/aggregations";
import {
  LatestCohortCounts,
  WeeklyRetentionCounts,
  WindowActivityCounts,
} from "@/application/domain/analytics/community/service";
import AnalyticsCommunityPresenter from "@/application/domain/analytics/community/presenter";
import AnalyticsPlatformPresenter from "@/application/domain/analytics/platform/presenter";
import { AnalyticsPlatformTotalsRow } from "@/application/domain/analytics/platform/data/type";

/**
 * Dashboard-level shape mappers. Combines per-community rows
 * (community subdomain) with platform totals (platform subdomain)
 * into the single AnalyticsDashboardPayload returned by
 * `Query.analyticsDashboard`.
 */
export default class AnalyticsPresenter {
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
  }): GqlAnalyticsCommunityOverview {
    return {
      communityId: params.communityId,
      communityName: params.communityName,
      totalMembers: params.totalMembers,
      segmentCounts: AnalyticsCommunityPresenter.segmentCounts(params.stageCounts),
      windowActivity: AnalyticsCommunityPresenter.windowActivity(params.windowActivity),
      weeklyRetention: AnalyticsCommunityPresenter.weeklyRetention(params.weeklyRetention),
      latestCohort: AnalyticsCommunityPresenter.latestCohort(params.latestCohort),
      hubMemberCount: params.hubMemberCount,
      tenureDistribution: AnalyticsCommunityPresenter.tenureDistribution(params.tenureDistribution),
      dormantCount: params.dormantCount,
    };
  }

  static dashboard(params: {
    asOf: Date;
    platform: AnalyticsPlatformTotalsRow;
    communities: GqlAnalyticsCommunityOverview[];
  }): GqlAnalyticsDashboardPayload {
    return {
      asOf: params.asOf,
      platform: AnalyticsPlatformPresenter.platform(params.platform),
      communities: params.communities,
    };
  }
}
