import { IContext } from "@/types/server";
import {
  AnalyticsAllTimeTotalsRow,
  AnalyticsChainDepthBucketRow,
  AnalyticsCommunityRow,
  AnalyticsMemberStatsRow,
  AnalyticsActivitySnapshotRow,
  AnalyticsHubMemberCountRow,
  AnalyticsMonthlyActivityRow,
  AnalyticsNewMemberCountRow,
  AnalyticsWindowActivityCountsRow,
} from "@/application/domain/analytics/community/data/type";

/**
 * Repository contract for the analytics community surface.
 *
 * All queries read through `ctx.issuer.public` (MVs bypass RLS anyway,
 * and the t_memberships / t_transactions reads here are gated at the
 * resolver with `@authz(rules: [IsAdmin])`). No method mutates state.
 */
export interface IAnalyticsCommunityRepository {
  /** Every community id + display name, ordered by name. */
  findAllCommunities(ctx: IContext): Promise<AnalyticsCommunityRow[]>;

  /**
   * Resolve one community by id, returning the same projection shape
   * as `findAllCommunities`. Returns null when the id is unknown so
   * the usecase can surface a NotFoundError without a fallback scan.
   */
  findCommunityById(
    ctx: IContext,
    communityId: string,
  ): Promise<AnalyticsCommunityRow | null>;

  /**
   * Per-member LTV-variable counters at `asOf` for every community in
   * `communityIds`, returned as `Map<communityId, rows[]>` pre-seeded
   * with empty arrays. Scoped to `status='JOINED'`. A member with zero
   * DONATION-outs is still present (donationOutMonths=0,
   * userSendRate=0, latent stage). Same-user JOIN keys are tightened
   * to `(user_id, community_id)` so a user who is a member of multiple
   * communities is correctly bucketed.
   */
  findMemberStatsBulk(
    ctx: IContext,
    communityIds: string[],
    asOf: Date,
  ): Promise<Map<string, AnalyticsMemberStatsRow[]>>;

  /**
   * Monthly activity series for `windowMonths` trailing JST months
   * ending at `asOf`. One row per month with data; months with zero
   * senders and zero new members are still emitted (with zero
   * counters) so the UI can render a contiguous x-axis.
   *
   * `hubBreadthThreshold` controls the per-month hub classification:
   * a sender is counted as a hub for month N if they sent DONATION
   * to >= hubBreadthThreshold distinct recipients during the trailing
   * 28-day window ending at month N's end. Same threshold semantic
   * as `findWindowHubMemberCountBulk`, evaluated at each month-end.
   */
  findMonthlyActivity(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowMonths: number,
    hubBreadthThreshold: number,
  ): Promise<AnalyticsMonthlyActivityRow[]>;

  /**
   * Latest-month unique sender count + total_members snapshot used to
   * compute `communityActivityRate` and power growth-rate math.
   */
  findActivitySnapshot(
    ctx: IContext,
    communityId: string,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ): Promise<AnalyticsActivitySnapshotRow>;

  /**
   * Count of `t_memberships.status='JOINED'` rows whose `created_at`
   * falls within `[from, to)`. Used for the `no_new_members` alert.
   */
  findNewMemberCount(
    ctx: IContext,
    communityId: string,
    from: Date,
    to: Date,
  ): Promise<AnalyticsNewMemberCountRow>;

  /**
   * Per-community count of members whose distinct DONATION recipient
   * count within `[currLower, upper)` reaches `hubBreadthThreshold`,
   * computed for every community in `communityIds` in one SQL pass and
   * returned as `Map<communityId, {count}>` pre-seeded with count=0 for
   * every requested community. Backs
   * `AnalyticsCommunityOverview.hubMemberCount`.
   *
   * The recipient count is computed against `t_transactions` directly
   * (not `mv_user_transaction_daily`) because the MV's per-day
   * `unique_counterparties` does not compose into a window-wide
   * DISTINCT — the same recipient across multiple days would
   * double-count under SUM.
   *
   * Senders are restricted to users still JOINED in this community at
   * `upper` (membership filter mirrors `findActivitySnapshot`), so a
   * now-departed member who donated while a member is excluded.
   * Without that filter, the L1 invariant
   * `hubMemberCount <= senderCount <= totalMembers` would not hold.
   */
  findWindowHubMemberCountBulk(
    ctx: IContext,
    communityIds: string[],
    currLower: Date,
    upper: Date,
    hubBreadthThreshold: number,
  ): Promise<Map<string, AnalyticsHubMemberCountRow>>;

  /**
   * All five raw counts the L1 `AnalyticsWindowActivity` payload needs
   * for the parametric window pair driven by `windowDays`, computed for
   * every community in `communityIds` in one SQL pass and returned as
   * `Map<communityId, counts>` pre-seeded with zero-row defaults.
   *
   * The SQL issues two scans: one over `mv_user_transaction_daily`
   * spanning `[prevLower, upper)` collapsed by FILTER clauses into
   * curr / prev / intersection counts, and one over `t_memberships`
   * over the same span split into curr / prev new-member counts.
   */
  findWindowActivityCountsBulk(
    ctx: IContext,
    communityIds: string[],
    prevLower: Date,
    currLower: Date,
    upper: Date,
  ): Promise<Map<string, AnalyticsWindowActivityCountsRow>>;

  /** All-time DONATION totals + MV data window for the summary card,
   * clamped at `asOf` for historic-asOf consistency with the rest of
   * the dashboard. */
  findAllTimeTotals(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<AnalyticsAllTimeTotalsRow>;

  /**
   * All-time DONATION chain-depth histogram for one community,
   * clamped at `asOf` for historic-asOf consistency. Returns
   * exactly `maxBucketDepth` rows (depth 1..maxBucketDepth, with
   * the last bucket aggregating chain_depth >= maxBucketDepth) so
   * the service / presenter doesn't need to fill gaps. Backs
   * `AnalyticsCommunityDetailPayload.chainDepthDistribution`.
   */
  findChainDepthDistribution(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    maxBucketDepth: number,
  ): Promise<AnalyticsChainDepthBucketRow[]>;
}
