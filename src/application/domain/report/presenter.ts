import { GqlReport, GqlReportTemplate, GqlReportsConnection } from "@/types/graphql";
import { PrismaReport, PrismaReportTemplate } from "@/application/domain/report/data/type";
import {
  CommunityContextRow,
  DeepestChainRow,
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/data/interface";
import {
  CommunityContext,
  DeepestChainItem,
  TopUserItem,
  WeeklyReportPayload,
} from "@/application/domain/report/types";
import { bigintToSafeNumber, daysBetweenJst, toJstIsoDate } from "@/application/domain/report/util";

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
      };
    });

    return {
      period: {
        from: toJstIsoDate(input.range.from),
        to: toJstIsoDate(input.range.to),
      },
      community_id: input.communityId,
      community_context: communityContext,
      deepest_chain: deepestChain,
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
