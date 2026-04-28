import {
  GqlReport,
  GqlReportTemplate,
  GqlReportsConnection,
  GqlAdminReportSummaryConnection,
  GqlAdminReportSummaryRow,
} from "@/types/graphql";
import {
  CommunitySummaryCursor,
  PrismaReport,
  PrismaReportTemplate,
} from "@/application/domain/report/data/type";
import {
  CohortRetentionRow,
  CommunityContextRow,
  DeepestChainRow,
  PeriodAggregateRow,
  RetentionAggregateRow,
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/transactionStats/data/rows";
import {
  CommunityContext,
  DeepestChainItem,
  PreviousPeriodSummary,
  RetentionSummary,
  TopUserItem,
  WeeklyReportPayload,
} from "@/application/domain/report/types";
import { bigintToSafeNumber, daysBetweenJst, toJstIsoDate } from "@/application/domain/report/util";
import {
  aggregateTransactionTotals,
  computeActiveRate,
  computeAvgChainDepth,
  computeDaysSinceLastPublish,
  computeGrowthRates,
  computePageInfo,
  computeRetentionSummary,
} from "@/application/domain/report/transactionStats/weeklyAggregator";

/**
 * Internal → GraphQL `edge.cursor` (base64url JSON of `{at, id}`).
 * Mirror of `ReportConverter.decodeCommunitySummaryCursor`; kept on
 * the presenter side because `edge.cursor` is a GraphQL output
 * concern and the rest of the report presenters already own the
 * internal-to-Gql wire-format direction. Exported only so the
 * round-trip unit test can assert encode/decode symmetry across the
 * converter / presenter pair without exercising the full
 * connection presenter.
 */
export function encodeCommunitySummaryCursor(c: CommunitySummaryCursor): string {
  return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
}

export default class ReportPresenter {
  static weeklyPayload(input: {
    communityId: string;
    range: { from: Date; to: Date };
    referenceDate: Date;
    summaries: TransactionSummaryDailyRow[];
    activeUsers: TransactionActiveUsersDailyRow[];
    /**
     * Already ordered by DB (SUM(points_in) + SUM(points_out)) DESC and
     * limited to top N in the repository, so the presenter does no sort/slice.
     */
    topUserAggregates: UserTransactionAggregateRow[];
    profiles: UserProfileForReportRow[];
    comments: TransactionCommentRow[];
    communityContext: CommunityContextRow | null;
    deepestChain: DeepestChainRow | null;
    /**
     * Optional markdown blob sourced from `ReportTemplate.communityContext`.
     * Populated by the AI-generation usecase (PR-D) when rendering under a
     * community-scoped template; left unset for raw payload dumps and the
     * single-variant Phase 1 flow.
     */
    customContext?: string | null;
    /**
     * Per-user true distinct counterparty counts for the reporting window,
     * keyed by userId. A missing key means the user had no outgoing
     * transactions over the period (the repository only emits rows for
     * users that actually sent); the presenter surfaces those as `null` on
     * `TopUserItem` so "gave to zero people" and "receiver-only" are
     * distinguishable downstream.
     */
    trueUniqueCounterparties?: Map<string, number>;
    /**
     * Pre-fetched retention counts (sender frame) + cohort retention rows.
     * `totalMembers` is threaded through from the community context so the
     * presenter can divide without re-reading the same number. `null` when
     * the usecase did not opt into retention, in which case the payload's
     * `retention` field is `null` and the prompt keys on presence.
     *
     * `totalMembers` is `null` when the community context lookup came back
     * empty (missing / soft-deleted community) — in that case the rate
     * fields collapse to `null` instead of leaking a divide-by-zero or a
     * bogus "100%" from using the aggregate's own counts as the denominator.
     * The raw counters (new_members / retained_senders / ...) still surface
     * so the block remains useful; only the derived rates go null.
     */
    retention?: {
      aggregate: RetentionAggregateRow;
      totalMembers: number | null;
      week1: CohortRetentionRow | null;
      week4: CohortRetentionRow | null;
    } | null;
    /**
     * Pre-fetched aggregate for the window immediately preceding `range`,
     * plus its range. Present only when the usecase opted into the
     * previous-period comparison. The presenter computes growth-rate math
     * here so divide-by-zero falls out as `null` and never leaks into the
     * LLM prompt.
     */
    previousPeriod?: {
      range: { from: Date; to: Date };
      aggregate: PeriodAggregateRow;
    } | null;
  }): WeeklyReportPayload {
    const profileByUserId = new Map(input.profiles.map((p) => [p.userId, p]));

    const communityContext: CommunityContext | null = input.communityContext
      ? {
          community_id: input.communityContext.communityId,
          name: input.communityContext.name,
          point_name: input.communityContext.pointName,
          bio: input.communityContext.bio,
          established_at: input.communityContext.establishedAt
            ? toJstIsoDate(input.communityContext.establishedAt)
            : null,
          website: input.communityContext.website,
          total_members: input.communityContext.totalMembers,
          active_users_in_window: input.communityContext.activeUsersInWindow,
          active_rate: computeActiveRate(
            input.communityContext.activeUsersInWindow,
            input.communityContext.totalMembers,
          ),
          custom_context: input.customContext ?? null,
        }
      : null;

    const deepestChain: DeepestChainItem | null = input.deepestChain
      ? {
          transaction_id: input.deepestChain.transactionId,
          chain_depth: input.deepestChain.chainDepth,
          reason: input.deepestChain.reason,
          comment: input.deepestChain.comment,
          date: toJstIsoDate(input.deepestChain.date),
          from_user_id: input.deepestChain.fromUserId,
          to_user_id: input.deepestChain.toUserId,
          created_by_user_id: input.deepestChain.createdByUserId,
          parent_tx_id: input.deepestChain.parentTxId,
        }
      : null;

    const trueUniqueMap = input.trueUniqueCounterparties;
    const topUsers: TopUserItem[] = input.topUserAggregates.map((u) => {
      const p = profileByUserId.get(u.userId);
      return {
        user_id: u.userId,
        name: p?.name ?? "",
        user_bio: p?.userBio ?? null,
        membership_bio: p?.membershipBio ?? null,
        headline: p?.headline ?? null,
        role: p?.role ?? "MEMBER",
        joined_at: p ? toJstIsoDate(p.joinedAt) : "",
        days_since_joined: p ? daysBetweenJst(p.joinedAt, input.referenceDate) : 0,
        tx_count_in: u.txCountIn,
        tx_count_out: u.txCountOut,
        points_in: bigintToSafeNumber(u.pointsIn),
        points_out: bigintToSafeNumber(u.pointsOut),
        donation_out_count: u.donationOutCount,
        donation_out_points: bigintToSafeNumber(u.donationOutPoints),
        received_donation_count: u.receivedDonationCount,
        chain_root_count: u.chainRootCount,
        max_chain_depth_started: u.maxChainDepthStarted,
        chain_depth_reached_max: u.chainDepthReachedMax,
        unique_counterparties_sum: u.uniqueCounterpartiesSum,
        true_unique_counterparties: trueUniqueMap?.get(u.userId) ?? null,
      };
    });

    const { txCount: currentTxCount, pointsSum: currentPointsSum } =
      aggregateTransactionTotals(input.summaries);
    // Sourced from `findCommunityContext`, which scopes the count to
    // peer-to-peer DONATION activity — matching the equivalent scoping in
    // `findPeriodAggregate` so the `growth_rate.active_users` math below
    // compares self-consistent current-vs-previous numbers. When the
    // community context lookup returned null we do NOT fall back to the
    // retention aggregate: even though both are DONATION-scoped now, the
    // honest answer in that edge case is "no ground truth for the current
    // window", and `growth_rate.active_users` collapses to `null` below.
    const currentActiveUsers = input.communityContext?.activeUsersInWindow ?? 0;

    const retention: RetentionSummary | null = input.retention
      ? computeRetentionSummary(input.retention)
      : null;

    const previousPeriod: PreviousPeriodSummary | null = input.previousPeriod
      ? {
          period: {
            from: toJstIsoDate(input.previousPeriod.range.from),
            to: toJstIsoDate(input.previousPeriod.range.to),
          },
          active_users_in_window: input.previousPeriod.aggregate.activeUsersInWindow,
          total_tx_count: input.previousPeriod.aggregate.totalTxCount,
          total_points_sum: bigintToSafeNumber(input.previousPeriod.aggregate.totalPointsSum),
          new_members: input.previousPeriod.aggregate.newMembers,
          growth_rate: computeGrowthRates({
            currentTxCount,
            currentPointsSum,
            currentActiveUsers,
            hasCommunityContext: input.communityContext !== null,
            previousAggregate: input.previousPeriod.aggregate,
          }),
        }
      : null;

    return {
      period: {
        from: toJstIsoDate(input.range.from),
        to: toJstIsoDate(input.range.to),
      },
      community_id: input.communityId,
      community_context: communityContext,
      deepest_chain: deepestChain,
      previous_period: previousPeriod,
      retention,
      daily_summaries: input.summaries.map((s) => ({
        date: toJstIsoDate(s.date),
        reason: s.reason,
        tx_count: s.txCount,
        points_sum: bigintToSafeNumber(s.pointsSum),
        chain_root_count: s.chainRootCount,
        chain_descendant_count: s.chainDescendantCount,
        max_chain_depth: s.maxChainDepth,
        avg_chain_depth: computeAvgChainDepth(s),
        issuance_count: s.issuanceCount,
        burn_count: s.burnCount,
      })),
      daily_active_users: input.activeUsers.map((u) => ({
        date: toJstIsoDate(u.date),
        active_users: u.activeUsers,
        senders: u.senders,
        receivers: u.receivers,
      })),
      top_users: topUsers,
      highlight_comments: input.comments.map((c) => ({
        transaction_id: c.transactionId,
        date: toJstIsoDate(c.date),
        reason: c.reason,
        points: c.points,
        comment: c.comment,
        from_user_id: c.fromUserId,
        to_user_id: c.toUserId,
        created_by_user_id: c.createdByUserId,
        chain_depth: c.chainDepth,
      })),
    };
  }

  // Relationship fields (community, template, parentRun, regenerations,
  // generatedByUser, publishedByUser, targetUser, updatedByUser) are
  // resolved by field resolvers via DataLoaders — the Prisma select shape
  // intentionally omits them.  The cast bridges the type gap until
  // Report/ReportTemplate are added to codegen.yaml mappers.
  static report(r: PrismaReport): GqlReport {
    return r as unknown as GqlReport;
  }

  static reportTemplate(t: PrismaReportTemplate): GqlReportTemplate {
    return t as unknown as GqlReportTemplate;
  }

  static reportsConnection(
    items: PrismaReport[],
    totalCount: number,
    requestedFirst: number,
  ): GqlReportsConnection {
    const { hasNextPage, page } = computePageInfo(items, requestedFirst);
    return {
      edges: page.map((r) => ({
        cursor: r.id,
        node: ReportPresenter.report(r),
      })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: page[0]?.id ?? null,
        endCursor: page[page.length - 1]?.id ?? null,
      },
      totalCount,
    };
  }

  /**
   * Phase 2 sysAdmin: AdminReportSummaryConnection presenter. Each
   * row carries the denormalized last-publish pointer plus the rolling
   * 90-day count from the repository; the resolver hydrates the
   * `community` / `lastPublishedReport` field via dataloader, so the
   * returned shape only needs the bare ids and scalars.
   *
   * `daysSinceLastPublish` is computed here from `lastPublishedAt`
   * (anchored to the request time) rather than denormalized — it
   * changes daily and the math is one line. Returns `null` for never-
   * published communities so the UI can render "—" instead of "0
   * days" (which would suggest a recent publish).
   */
  static adminReportSummaryConnection(
    items: Array<{
      communityId: string;
      lastPublishedReportId: string | null;
      lastPublishedAt: Date | null;
      publishedCountLast90Days: number;
    }>,
    totalCount: number,
    requestedFirst: number,
  ): GqlAdminReportSummaryConnection {
    const { hasNextPage, page } = computePageInfo(items, requestedFirst);
    const now = Date.now();
    // Composite cursor `{at, id}` matches the SQL sort
    // (`last_published_report_at ASC NULLS FIRST, id ASC`). Encoding
    // both halves is required for correctness: a row with `at=null`
    // and a row with `at=2026-01-01` may share the same `id` ordering
    // arbitrarily, but only one of them is the true successor of the
    // cursor when paginating across the dormant / chronological tiers.
    const buildCursor = (row: { communityId: string; lastPublishedAt: Date | null }) =>
      encodeCommunitySummaryCursor({
        at: row.lastPublishedAt?.toISOString() ?? null,
        id: row.communityId,
      });
    return {
      edges: page.map((row) => ({
        cursor: buildCursor(row),
        // Field resolvers (`community`, `lastPublishedReport`) on
        // AdminReportSummaryRow read `communityId` /
        // `lastPublishedReportId` off the parent and hydrate via
        // dataloader. Casting through `unknown` matches the
        // `report` / `reportTemplate` presenters above — the parent
        // shape carries the relation ids; the field resolvers fill
        // in the relations themselves at GraphQL execution time.
        node: {
          communityId: row.communityId,
          lastPublishedReportId: row.lastPublishedReportId,
          lastPublishedAt: row.lastPublishedAt,
          daysSinceLastPublish: computeDaysSinceLastPublish(row.lastPublishedAt, now),
          publishedCountLast90Days: row.publishedCountLast90Days,
        } as unknown as GqlAdminReportSummaryRow,
      })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: page[0] ? buildCursor(page[0]) : null,
        endCursor: page[page.length - 1] ? buildCursor(page[page.length - 1]) : null,
      },
      totalCount,
    };
  }
}
