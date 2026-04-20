import { GqlReport, GqlReportTemplate, GqlReportsConnection } from "@/types/graphql";
import { PrismaReport, PrismaReportTemplate } from "@/application/domain/report/data/type";
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
} from "@/application/domain/report/data/interface";
import {
  CommunityContext,
  DeepestChainItem,
  PreviousPeriodSummary,
  RetentionSummary,
  TopUserItem,
  WeeklyReportPayload,
} from "@/application/domain/report/types";
import {
  bigintToSafeNumber,
  daysBetweenJst,
  percentChange,
  toJstIsoDate,
} from "@/application/domain/report/util";

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
          active_rate:
            input.communityContext.totalMembers > 0
              ? input.communityContext.activeUsersInWindow / input.communityContext.totalMembers
              : null,
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

    const currentTxCount = input.summaries.reduce((acc, s) => acc + s.txCount, 0);
    // Accumulate the BigInt sums before narrowing so the safe-integer guard
    // runs against the TOTAL rather than each reason row. Narrowing per row
    // and then summing as Number would let a total that exceeds
    // Number.MAX_SAFE_INTEGER slip through silently even when each individual
    // row is safe.
    const currentPointsSumBigInt = input.summaries.reduce(
      (acc, s) => acc + s.pointsSum,
      0n,
    );
    const currentPointsSum = bigintToSafeNumber(currentPointsSumBigInt);
    // Prefer `community_context.active_users_in_window`, but fall back to
    // the retention aggregate's `current_active_count` when the community
    // context lookup came back null (missing / soft-deleted community).
    // Without this fallback, `growth_rate.active_users` collapses to the
    // previous-window numerator / 0 math and misreports as −100% even
    // when the current window actually had activity that the retention
    // pass successfully counted.
    const currentActiveUsers =
      input.communityContext?.activeUsersInWindow ??
      input.retention?.aggregate.currentActiveCount ??
      0;

    const retention: RetentionSummary | null = input.retention
      ? {
          new_members: input.retention.aggregate.newMembers,
          retained_senders: input.retention.aggregate.retainedSenders,
          returned_senders: input.retention.aggregate.returnedSenders,
          churned_senders: input.retention.aggregate.churnedSenders,
          active_rate_sender:
            input.retention.totalMembers !== null && input.retention.totalMembers > 0
              ? input.retention.aggregate.currentSendersCount / input.retention.totalMembers
              : null,
          active_rate_any:
            input.retention.totalMembers !== null && input.retention.totalMembers > 0
              ? input.retention.aggregate.currentActiveCount / input.retention.totalMembers
              : null,
          // Week-N rows with cohortSize=0 collapse to null here (rather
          // than 0%) so the LLM doesn't report "0% retention" for a
          // cohort that never existed — e.g. a community too young to
          // have a 4-weeks-ago cohort yet.
          week1_retention:
            input.retention.week1 && input.retention.week1.cohortSize > 0
              ? input.retention.week1.activeNextWeek / input.retention.week1.cohortSize
              : null,
          week4_retention:
            input.retention.week4 && input.retention.week4.cohortSize > 0
              ? input.retention.week4.activeNextWeek / input.retention.week4.cohortSize
              : null,
        }
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
          growth_rate: {
            active_users: percentChange(
              currentActiveUsers,
              input.previousPeriod.aggregate.activeUsersInWindow,
            ),
            tx_count: percentChange(currentTxCount, input.previousPeriod.aggregate.totalTxCount),
            points_sum: percentChange(
              currentPointsSum,
              bigintToSafeNumber(input.previousPeriod.aggregate.totalPointsSum),
            ),
          },
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
        // chain_depth is NULL for non-chain reasons (POINT_ISSUED / TICKET_* /
        // OPPORTUNITY_*) and can also be NULL on chain-eligible reasons when
        // no parent tx was found upstream. Divide by the count of rows that
        // actually carry a chain_depth (root + descendant), not by the full
        // tx_count, since SUM(chain_depth) in SQL skips NULL rows.
        avg_chain_depth:
          s.maxChainDepth !== null && s.chainRootCount + s.chainDescendantCount > 0
            ? s.sumChainDepth / (s.chainRootCount + s.chainDescendantCount)
            : null,
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
    const hasNextPage = items.length > requestedFirst;
    const page = hasNextPage ? items.slice(0, requestedFirst) : items;
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
}
