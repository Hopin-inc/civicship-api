import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { User, Community, Membership, MembershipHistory, Wallet, CurrentPointView, AccumulatedPointView, Opportunity, OpportunitySlot, Place, Participation, ParticipationStatusHistory, Article, Utility, Ticket, TicketIssuer, TicketClaimLink, TicketStatusHistory, Transaction, City, State } from '@prisma/client/index.d';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: bigint; output: bigint; }
  Datetime: { input: Date; output: Date; }
  Decimal: { input: string; output: string; }
  JSON: { input: any; output: any; }
  Upload: { input: typeof import('graphql-upload/GraphQLUpload.mjs'); output: typeof import('graphql-upload/GraphQLUpload.mjs'); }
};

export type GqlAccumulatedPointView = {
  __typename?: 'AccumulatedPointView';
  accumulatedPoint: Scalars['BigInt']['output'];
  walletId?: Maybe<Scalars['String']['output']>;
};

export type GqlAdminReportSummaryConnection = {
  __typename?: 'AdminReportSummaryConnection';
  edges?: Maybe<Array<Maybe<GqlAdminReportSummaryEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlAdminReportSummaryEdge = GqlEdge & {
  __typename?: 'AdminReportSummaryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlAdminReportSummaryRow>;
};

export type GqlAdminReportSummaryRow = {
  __typename?: 'AdminReportSummaryRow';
  community: GqlCommunity;
  daysSinceLastPublish?: Maybe<Scalars['Int']['output']>;
  lastPublishedAt?: Maybe<Scalars['Datetime']['output']>;
  lastPublishedReport?: Maybe<GqlReport>;
  publishedCountLast90Days: Scalars['Int']['output'];
};

export type GqlAdminTemplateFeedbackStats = {
  __typename?: 'AdminTemplateFeedbackStats';
  avgRating?: Maybe<Scalars['Float']['output']>;
  ratingDistribution: Array<GqlReportFeedbackRatingBucket>;
  totalCount: Scalars['Int']['output'];
};

/**
 * One bucket of the all-time DONATION chain-depth histogram. See
 * `AnalyticsCommunityPayload.chainDepthDistribution`.
 */
export type GqlAnalyticsChainDepthBucket = {
  __typename?: 'AnalyticsChainDepthBucket';
  /**
   * Number of all-time DONATION transactions whose `chain_depth`
   * falls into this bucket. Always non-negative.
   */
  count: Scalars['Int']['output'];
  /**
   * Chain-depth bucket key. Range 1..5; the 5 bucket aggregates
   * `chain_depth >= 5`. See `AnalyticsCommunitySummaryCard
   * .maxChainDepthAllTime` for the underlying semantic.
   */
  depth: Scalars['Int']['output'];
};

/**
 * One cohort's funnel progression. See
 * `AnalyticsCommunityPayload.cohortFunnel` for the stage
 * semantics and the JOINED-at-asOf scoping rule.
 */
export type GqlAnalyticsCohortFunnelPoint = {
  __typename?: 'AnalyticsCohortFunnelPoint';
  /**
   * Cohort size: number of JOINED memberships whose `created_at`
   * falls within this cohort month. The funnel's entry stage —
   * the denominator the client divides downstream stages by to
   * derive percentages.
   */
  acquired: Scalars['Int']['output'];
  /**
   * Of the cohort, members who sent at least one DONATION within
   * 30 days of their join (per-member, measured from each
   * individual's `created_at` rather than a calendar-clamped
   * window). The "first-30-day activation" funnel stage.
   */
  activatedD30: Scalars['Int']['output'];
  /**
   * JST first day of the cohort's entry month, e.g.
   * 2025-10-01T00:00+09:00. UTC-encoded at JST midnight, same
   * convention as `AnalyticsMonthlyActivityPoint.month` and
   * `AnalyticsCohortRetentionPoint.cohortMonth`.
   */
  cohortMonth: Scalars['Datetime']['output'];
  /**
   * Of the cohort, members currently in the habitual segment
   * (`userSendRate >= segmentThresholds.tier1` AND tenure floor).
   * THRESHOLD-DEPENDENT — see the parent field's doc.
   */
  habitual: Scalars['Int']['output'];
  /**
   * Of the cohort, members who sent DONATION in >= 2 distinct JST
   * months as of asOf. The "came back at least once" stage.
   * Cumulative — once a member has 2+ donation months in their
   * history they stay counted in this stage even if they later go
   * quiet.
   */
  repeated: Scalars['Int']['output'];
};

/** One entry-month cohort's retention curve. */
export type GqlAnalyticsCohortRetentionPoint = {
  __typename?: 'AnalyticsCohortRetentionPoint';
  /** Entry month, first day JST (e.g. 2025-10-01T00:00+09:00). */
  cohortMonth: Scalars['Datetime']['output'];
  /** Cohort size at entry (status='JOINED' joiners in the month). */
  cohortSize: Scalars['Int']['output'];
  /**
   * Fraction of the cohort with a DONATION out in the SECOND month after
   * entry (m+1). null for an empty cohort or a cohort too recent to have
   * a completed m+1 window.
   */
  retentionM1?: Maybe<Scalars['Float']['output']>;
  /** Fraction active in m+3. */
  retentionM3?: Maybe<Scalars['Float']['output']>;
  /** Fraction active in m+6. */
  retentionM6?: Maybe<Scalars['Float']['output']>;
};

/**
 * API-side alert flags. Boolean only: the server owns the cross-field
 * judgement, the client just renders the badge.
 */
export type GqlAnalyticsCommunityAlerts = {
  __typename?: 'AnalyticsCommunityAlerts';
  /** Month-over-month communityActivityRate change <= -20%. */
  activeDrop: Scalars['Boolean']['output'];
  /** Latest-week churned_senders > retained_senders. */
  churnSpike: Scalars['Boolean']['output'];
  /** No t_memberships.created_at rows (status='JOINED') in the last 14 days. */
  noNewMembers: Scalars['Boolean']['output'];
};

export type GqlAnalyticsCommunityInput = {
  /** As-of timestamp (see AnalyticsDashboardInput.asOf). */
  asOf?: InputMaybe<Scalars['Datetime']['input']>;
  /** Target community id. */
  communityId: Scalars['ID']['input'];
  /**
   * Opaque cursor for pagination. Internally a base64-encoded offset of
   * the prior page's position. Treat as opaque — pass back the cursor
   * returned by the previous response unchanged.
   */
  cursor?: InputMaybe<Scalars['String']['input']>;
  /**
   * Days since a member's most recent DONATION above which they are
   * classified as "dormant". Used to populate
   * `AnalyticsCommunityPayload.dormantCount`. See the same-named
   * field on AnalyticsDashboardInput for the full semantic.
   *
   * Default 30 (≈ one month of silence). Effective range 1..365;
   * values outside are silently clamped on the server.
   */
  dormantThresholdDays?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Minimum number of distinct DONATION recipients within the trailing
   * 28-day window ending at each month-end for a member to be classified
   * as a hub in that month. Used to populate
   * `AnalyticsMonthlyActivityPoint.hubMemberCount`. Same semantic as
   * `AnalyticsDashboardInput.hubBreadthThreshold`, applied at month-end
   * rather than at request `asOf`.
   *
   * Default 3. Effective range 1..1000; values outside are silently
   * clamped on the server. Pass the same value used on
   * `AnalyticsDashboardInput.hubBreadthThreshold` to keep the L1
   * hubMemberCount and the latest entry of
   * `monthlyActivityTrend.hubMemberCount` directly comparable.
   */
  hubBreadthThreshold?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Member list page size (default 50, max 1000). Raised from the
   * previous max of 200 so client-side aggregations that need every
   * member of a community (e.g. the "受領→送付 転換率" /
   * recipient-to-sender conversion rate, hub-persistence cohorts,
   * new-member retention breakdowns) can pull a single full page
   * without N round-trips. Communities larger than 1000 members
   * still need cursor pagination.
   */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Stage-count thresholds for the stage distribution and tier counts. */
  segmentThresholds?: InputMaybe<GqlAnalyticsSegmentThresholdsInput>;
  /** Member list filter. Defaults to `minSendRate = 0.7` (habitual only). */
  userFilter?: InputMaybe<GqlAnalyticsUserListFilter>;
  /** Member list sort. Defaults to SEND_RATE DESC. */
  userSort?: InputMaybe<GqlAnalyticsUserListSort>;
  /**
   * How many trailing JST months to include in the trend / cohort arrays.
   * Default 10.
   */
  windowMonths?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * One row of the L1 all-community table. Designed for at-a-glance
 * intervention judgment: each row carries the raw counts the client
 * needs to derive rates, growth, alerts, sort keys, and filter
 * predicates without a second round-trip.
 *
 * Calendar-month metrics live on the L2 detail card
 * (AnalyticsCommunitySummaryCard) — L1 is rolling-window only.
 */
export type GqlAnalyticsCommunityOverview = {
  __typename?: 'AnalyticsCommunityOverview';
  /** Community id. */
  communityId: Scalars['ID']['output'];
  /** Community display name (t_communities.name). */
  communityName: Scalars['String']['output'];
  /**
   * Members who donated at some point but whose most recent
   * DONATION is older than `dormantThresholdDays` (default 30).
   * Distinct from `segmentCounts.passiveCount` (= "latent", never
   * donated): operators care about the difference because the
   * intervention is different — re-engage the dormant, onboard the
   * latent.
   *
   * Computed as
   *   COUNT(DISTINCT user_id)
   *   WHERE the user has at least one historical DONATION in this
   *     community AND `MAX(donation.created_at) < asOf -
   *     dormantThresholdDays`
   *     AND status='JOINED' at asOf
   *
   * Invariants the client may assert:
   *   0 <= dormantCount <= totalMembers - segmentCounts.passiveCount
   *
   * The upper bound holds because dormant members are by
   * construction ever-donated, which `passiveCount` excludes.
   */
  dormantCount: Scalars['Int']['output'];
  /**
   * Number of members classified as a "hub" within the parametric
   * window (`windowDays`):
   *
   *   hubMemberCount = COUNT(member)
   *     WHERE windowUniqueDonationRecipients >= input.hubBreadthThreshold
   *
   * `windowUniqueDonationRecipients` is the count of DISTINCT users
   * this member sent a DONATION to during
   * `[asOf - windowDays JST日, asOf + 1 JST日)` — distinct from the
   * L2 `AnalyticsMemberRow.uniqueDonationRecipients` field which is
   * tenure-wide. The window-scoped variant is computed on demand in
   * this aggregate but not exposed per-member at L1 (members
   * themselves are an L2 concern).
   *
   * Hub classification deliberately uses BREADTH only — a member
   * who reached `hubBreadthThreshold` distinct recipients during
   * the window necessarily transacted at least that many times,
   * making an explicit frequency floor redundant. This keeps the
   * threshold knobs to one (`hubBreadthThreshold`).
   *
   * Invariants (the client may assert these):
   *   hubMemberCount <= windowActivity.senderCount <= totalMembers
   *
   * The first holds because any hub member sent DONATION to
   * `>= hubBreadthThreshold` distinct counterparties during the
   * window — which requires at least that many DONATION
   * transactions — so they are necessarily a window sender. The
   * second because both `hubMemberCount` and `windowActivity.senderCount`
   * are computed from senders restricted to JOINED-at-asOf members
   * (a former member who left the community before asOf is excluded
   * even if they donated during the window) and totalMembers is
   * also JOINED-at-asOf, so the chain stays consistent.
   */
  hubMemberCount: Scalars['Int']['output'];
  /**
   * Latest completed monthly cohort and its M+1 activity. See
   * AnalyticsLatestCohort.
   */
  latestCohort: GqlAnalyticsLatestCohort;
  /**
   * Per-stage member counts (tier1 / tier2 / passive, cumulative
   * per the type doc) classified against input.segmentThresholds.
   */
  segmentCounts: GqlAnalyticsSegmentCounts;
  /**
   * Tenure-bucket distribution of members at asOf. See
   * AnalyticsTenureDistribution. Sum of buckets equals totalMembers.
   *
   * Lets the client surface community age structure at L1 without
   * drilling into the L2 member list (which would otherwise force
   * an N+1 round trip per community to compute distribution).
   */
  tenureDistribution: GqlAnalyticsTenureDistribution;
  /**
   * Total status='JOINED' members as of asOf. Members whose
   * created_at is after asOf are excluded from the count.
   */
  totalMembers: Scalars['Int']['output'];
  /**
   * Latest completed-week retention signals for client-side churn
   * detection. See AnalyticsWeeklyRetention.
   */
  weeklyRetention: GqlAnalyticsWeeklyRetention;
  /** Rolling-window DONATION activity. See AnalyticsWindowActivity. */
  windowActivity: GqlAnalyticsWindowActivity;
};

/** Root payload for analyticsCommunity (L2). */
export type GqlAnalyticsCommunityPayload = {
  __typename?: 'AnalyticsCommunityPayload';
  /** Alert flags (same structure as L1, evaluated for this community). */
  alerts: GqlAnalyticsCommunityAlerts;
  /** As-of timestamp echoed back. */
  asOf: Scalars['Datetime']['output'];
  /**
   * Distribution of DONATION `chain_depth` values across all-time
   * DONATION transactions in this community. Each bucket counts
   * distinct DONATION transactions whose `chain_depth` falls into
   * the bucket key (see `AnalyticsCommunitySummaryCard.maxChainDepthAllTime`
   * for the depth semantic — depth 1 is a root donation, depth N+1
   * means the sender's most recent received DONATION had depth N).
   *
   * Buckets are `{depth: 1..5, count}`; the depth-5 bucket
   * aggregates all transactions with `chain_depth >= 5`. Buckets
   * are returned in ascending depth order, with every bucket
   * emitted (count = 0 for depths with no transactions) so the
   * client can render a contiguous histogram axis without
   * zero-padding logic. Adjust the ceiling upward (e.g., to 10+)
   * in a follow-up if real-data inspection of `maxChainDepthAllTime`
   * shows meaningful population in the 5+ bucket.
   *
   * Powers the L3 "/network" chain-depth histogram: visualizes
   * whether donations propagate deeply (multi-hop reciprocity, tail
   * populated) or shallowly (one-shot direct gifts, mass at depth 1).
   */
  chainDepthDistribution: Array<GqlAnalyticsChainDepthBucket>;
  /**
   * Per-cohort funnel progression for the L3 "/activity" deep-dive.
   * One entry per JST entry-month within the trailing `windowMonths`
   * range, returned in ascending order (newest cohort last). Stages
   * match the L2 send-funnel structure:
   *
   *   acquisition  — cohort size at entry (JOINED memberships
   *                  created during the cohort month)
   *   activatedD30 — cohort members who sent >= 1 DONATION within
   *                  30 days of their join (per-member, not
   *                  calendar-clamped)
   *   repeated     — cohort members who sent DONATION in >= 2
   *                  distinct JST months (cumulative as of asOf)
   *   habitual     — cohort members currently in the habitual
   *                  segment (`userSendRate >= segmentThresholds
   *                  .tier1` AND tenure floor)
   *
   * ⚠ The `habitual` stage is THRESHOLD-DEPENDENT: it is derived
   * from the request's `segmentThresholds.tier1` (default 0.7),
   * same behaviour as `stages.habitual` and the L2 habitual count
   * card. Cross-request comparisons of the funnel's last stage
   * require matching threshold inputs. The `acquisition`,
   * `activatedD30`, and `repeated` stages are threshold-
   * independent by construction.
   *
   * All counts are JOINED-at-asOf scoped — a cohort member who
   * later left the community is excluded from `activatedD30` /
   * `repeated` / `habitual` even if they donated during the
   * measurement window. Same membership filter as `dormantCount`
   * / L1 `senderCount` / L2 monthly `hubMemberCount`.
   */
  cohortFunnel: Array<GqlAnalyticsCohortFunnelPoint>;
  /**
   * One entry per entry month (length <= windowMonths), newest last.
   * `retentionM*` fields are null when the cohort is empty or too recent.
   */
  cohortRetention: Array<GqlAnalyticsCohortRetentionPoint>;
  /** Community id. */
  communityId: Scalars['ID']['output'];
  /** Community display name. */
  communityName: Scalars['String']['output'];
  /**
   * Members who donated at some point but whose most recent
   * DONATION is older than `dormantThresholdDays` (default 30). See
   * the same-named field on `AnalyticsCommunityOverview` for the
   * full semantic. Exposed at L2 so the user-scope card can show
   * the dormancy ratio directly without re-aggregating from the
   * member list.
   */
  dormantCount: Scalars['Int']['output'];
  /** Paginated member list — see type doc. */
  memberList: GqlAnalyticsMemberList;
  /**
   * One entry per month (length <= windowMonths), newest last. Older
   * months with no MV data are omitted rather than zero-padded.
   */
  monthlyActivityTrend: Array<GqlAnalyticsMonthlyActivityPoint>;
  /**
   * One entry per ISO week, newest last. Length approximates
   * `windowMonths * ~4.3` weeks; sparse weeks with no activity still emit
   * a row with zero counters.
   */
  retentionTrend: Array<GqlAnalyticsRetentionTrendPoint>;
  /**
   * Stage distribution, classified server-side with the request's
   * thresholds. Computed over ALL members (independent of member-list
   * filter).
   */
  stages: GqlAnalyticsStageDistribution;
  /** Summary card — see type doc. */
  summary: GqlAnalyticsCommunitySummaryCard;
  /** Trailing window length in JST months (echoed back). */
  windowMonths: Scalars['Int']['output'];
};

/**
 * Summary card for a single community. Fronts the L2 detail screen and
 * answers "is this community improving?" in one row of numbers.
 */
export type GqlAnalyticsCommunitySummaryCard = {
  __typename?: 'AnalyticsCommunitySummaryCard';
  /**
   * Latest-month communityActivityRate (PRIMARY indicator — see module
   * docstring for the distinction vs userSendRate).
   */
  communityActivityRate: Scalars['Float']['output'];
  /**
   * 3-month trailing average of communityActivityRate, ending at the JST
   * calendar month containing asOf (inclusive). null when fewer than 3
   * months of data exist.
   */
  communityActivityRate3mAvg?: Maybe<Scalars['Float']['output']>;
  /** Community id. */
  communityId: Scalars['ID']['output'];
  /** Community display name. */
  communityName: Scalars['String']['output'];
  /** Oldest date with MV data for this community (JST calendar). */
  dataFrom?: Maybe<Scalars['Datetime']['output']>;
  /** Newest date with MV data for this community (JST calendar). */
  dataTo?: Maybe<Scalars['Datetime']['output']>;
  /**
   * Month-over-month % change in communityActivityRate (fraction, e.g.
   * -0.2 == -20%). null when the prior month has no data.
   */
  growthRateActivity?: Maybe<Scalars['Float']['output']>;
  /**
   * Maximum `chain_depth` observed in any DONATION, all-time, in
   * this community. null when no DONATION transactions exist.
   *
   * `chain_depth` semantics (set in transaction creation —
   * src/application/domain/transaction/service.ts:89, via
   * `findLatestReceivedTx`):
   *   - chain_depth = 1: a "root" donation. Either the sender
   *     had no prior received DONATION (= self-funded gift) or
   *     this is treated as the start of a chain.
   *   - chain_depth = N + 1: the sender's most recent received
   *     DONATION (parentTx) had `chain_depth = N`; the new
   *     donation propagates the chain by one step.
   *
   * Example trace: A donates to B → chain_depth 1.
   * B then donates to C, citing the receipt from A → chain_depth 2.
   * C donates to D similarly → chain_depth 3.
   *
   * `maxChainDepthAllTime = 1` therefore means "no propagation
   * ever happened" (every donation was a fresh root).
   * `maxChainDepthAllTime >= 2` means at least one
   * receive-then-pass-it-on event occurred.
   */
  maxChainDepthAllTime?: Maybe<Scalars['Int']['output']>;
  /** Cumulative members in tier2 or above under the supplied thresholds. */
  tier2Count: Scalars['Int']['output'];
  /** tier2Count / totalMembers (0.0–1.0). */
  tier2Pct: Scalars['Float']['output'];
  /**
   * Total DONATION points transferred, all-time (no window). Uses
   * t_transactions directly so the value is independent of MV retention.
   */
  totalDonationPointsAllTime: Scalars['Float']['output'];
  /** Total status='JOINED' members at asOf. */
  totalMembers: Scalars['Int']['output'];
};

/** Input for the L1 all-community overview (`analyticsDashboard`). */
export type GqlAnalyticsDashboardInput = {
  /**
   * As-of timestamp anchor. All trailing-window calculations are
   * anchored here:
   *   - parametric activity window: [asOf - windowDays, asOf + 1 JST日)
   *   - weekly retention: latest completed ISO week before asOf
   *   - latest cohort: (asOf JST月 - 2) so its M+1 window is fully past
   * Defaults to now when omitted.
   */
  asOf?: InputMaybe<Scalars['Datetime']['input']>;
  /**
   * Days since a member's most recent DONATION above which they are
   * classified as "dormant" — i.e. they donated at some point but
   * have gone quiet. Used to populate
   * `AnalyticsCommunityOverview.dormantCount`.
   *
   * Distinct from `segmentCounts.passiveCount` (= "latent", never
   * donated): operators care about the difference because the
   * intervention is different (re-engage a sleeper vs onboard a
   * newcomer). A member with `MAX(donation.created_at) < asOf -
   * dormantThresholdDays` is dormant.
   *
   * Default 30 (≈ one month of silence). Effective range 1..365;
   * values outside are silently clamped on the server.
   */
  dormantThresholdDays?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Minimum number of distinct DONATION recipients within the
   * parametric window (`windowDays`) for a member to be classified
   * as a hub. Used to populate `AnalyticsCommunityOverview.hubMemberCount`.
   *
   * Defaults to 3, meaning "sent DONATION to at least 3 different
   * people during the window". The threshold is on **unique
   * counterparties** (set cardinality), not transaction count, so a
   * member who donated 100 times to the same recipient does not
   * qualify on this axis alone.
   *
   * Effective range 1..1000; values outside are silently clamped on
   * the server.
   *
   * This is intentionally an absolute threshold rather than a
   * community-relative percentile: a percentile-based hub would
   * always classify ~N% of members as hubs by definition, defeating
   * cross-community comparison ("which communities have the highest
   * hub ratio?"). Community size differences are absorbed
   * client-side by displaying `hubMemberCount / totalMembers` rather
   * than the raw count.
   */
  hubBreadthThreshold?: InputMaybe<Scalars['Int']['input']>;
  /** Stage classification thresholds (see AnalyticsSegmentThresholdsInput). */
  segmentThresholds?: InputMaybe<GqlAnalyticsSegmentThresholdsInput>;
  /**
   * Length of the rolling activity window in JST days. Effective
   * range 7-90; values outside are silently clamped on the server.
   * Defaults to 28 (= 4 weeks, absorbs day-of-week variance).
   */
  windowDays?: InputMaybe<Scalars['Int']['input']>;
};

/** Root payload for analyticsDashboard (L1). */
export type GqlAnalyticsDashboardPayload = {
  __typename?: 'AnalyticsDashboardPayload';
  /** As-of timestamp echoed back (UTC instant). */
  asOf: Scalars['Datetime']['output'];
  /** One row per community, in dashboard sort order. */
  communities: Array<GqlAnalyticsCommunityOverview>;
  /** Platform-wide aggregate row. */
  platform: GqlAnalyticsPlatformSummary;
};

/**
 * Most recently completed monthly cohort plus its M+1 activity.
 * "M+1" follows standard cohort-analysis convention: the calendar
 * month immediately after the joining month.
 *
 * The cohort is selected as (asOf's JST month - 2 months) so its
 * M+1 window — the JST month immediately preceding asOf's month —
 * is fully past. This avoids reporting an artificially low retention
 * during the in-progress month.
 *
 * Raw counts are returned; the client divides for the retention rate
 * and decides how to handle small-N cohorts via `size`.
 */
export type GqlAnalyticsLatestCohort = {
  __typename?: 'AnalyticsLatestCohort';
  /**
   * Of those cohort members, how many sent at least one DONATION
   * during the M+1 month.
   */
  activeAtM1: Scalars['Int']['output'];
  /**
   * Cohort size: status='JOINED' members whose created_at falls
   * within the cohort month. 0 when no one joined that month
   * (callers should treat M+1 retention as null in that case).
   */
  size: Scalars['Int']['output'];
};

/** Paginated member list for the L2 detail. */
export type GqlAnalyticsMemberList = {
  __typename?: 'AnalyticsMemberList';
  /** Whether more pages exist after this one. */
  hasNextPage: Scalars['Boolean']['output'];
  /**
   * Opaque cursor to pass back in `AnalyticsCommunityInput.cursor` to
   * fetch the next page. null when no further pages exist.
   */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /**
   * Member rows for the current page, matching filter & sort applied
   * server-side.
   */
  users: Array<GqlAnalyticsMemberRow>;
};

/**
 * One row of the L2 member list. Raw values only — stage classification
 * (habitual / regular / occasional / latent) is the client's concern so
 * server-side thresholds can be tuned without a schema change.
 */
export type GqlAnalyticsMemberRow = {
  __typename?: 'AnalyticsMemberRow';
  /**
   * Tenure in JST calendar days (floor, minimum 1). Daily-grain
   * counterpart to `monthsIn`. Useful when the client wants a
   * finer-grained activity rate than the monthly `userSendRate`,
   * or when grouping members into tenure buckets that don't align
   * with calendar-month boundaries.
   */
  daysIn: Scalars['Int']['output'];
  /**
   * Distinct JST days the member received at least one DONATION.
   * Daily-grain counterpart to `donationInMonths`. Receiver-side
   * counterpart to `donationOutDays`.
   */
  donationInDays: Scalars['Int']['output'];
  /**
   * Distinct months with at least one DONATION in. Receiver-side
   * counterpart to `donationOutMonths`. Combined with
   * `totalPointsIn`, identifies members who have been part of the
   * receiving side of the gift economy and over how broad a span.
   */
  donationInMonths: Scalars['Int']['output'];
  /**
   * Distinct JST days the member sent at least one DONATION.
   * Daily-grain counterpart to `donationOutMonths`. Combined with
   * `daysIn`, the client can compute `donationOutDays / daysIn` as
   * a daily-cadence rate, complementing the monthly `userSendRate`.
   */
  donationOutDays: Scalars['Int']['output'];
  /** Distinct months with at least one DONATION out. */
  donationOutMonths: Scalars['Int']['output'];
  /**
   * JST date (UTC-encoded at JST midnight) of this member's most
   * recent DONATION out in this community. null when the member has
   * never sent a DONATION (= latent on the sender axis).
   *
   * Powers the L3 "/members" dormancy list: clients sort dormant
   * members by `lastDonationAt ASC` to surface the longest-quiet
   * senders first, and compute days-since-last-donation as
   * `(asOf - lastDonationAt) / 1 day` for the per-row badge. Same
   * underlying signal as `dormantCount`'s threshold check
   * (`MAX(donation.created_at) < asOf - dormantThresholdDays`),
   * exposed as the raw timestamp so the client can derive multiple
   * derived views without a server-side recomputation per request.
   */
  lastDonationAt?: Maybe<Scalars['Datetime']['output']>;
  /** Tenure in JST calendar months (floor, minimum 1). */
  monthsIn: Scalars['Int']['output'];
  /** User display name (users.name). null when the user has no name set. */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * All-time DONATION points received by this user in this community.
   * Receiver-side counterpart to `totalPointsOut`. Sums
   * `to_point_change` across DONATION transactions whose receiver
   * wallet belongs to this user in this community. Burn / system
   * sources (sender wallets without a user_id) are excluded so a
   * member who only received from a system grant scores 0 — same
   * scope as `totalPointsOut`.
   */
  totalPointsIn: Scalars['Float']['output'];
  /** All-time DONATION points sent by this user in this community. */
  totalPointsOut: Scalars['Float']['output'];
  /**
   * All-time count of distinct OTHER users this member has sent at
   * least one DONATION to in this community. The "network breadth"
   * half of the donor profile (paired with frequency-based
   * `userSendRate` and volume-based `totalPointsOut`):
   *
   *   breadth × frequency × volume → the client's per-member
   *   classification space (e.g. true hub vs single-target loyal vs
   *   rare-but-far-reaching).
   *
   * Counts unique counterparty user_id, not transaction count, so a
   * member who sent 100 donations to the same recipient still scores
   * 1. Excludes burn / system targets (recipient wallets without a
   * user_id).
   */
  uniqueDonationRecipients: Scalars['Int']['output'];
  /**
   * All-time count of distinct OTHER users that have sent at least
   * one DONATION to this member in this community. The receiver-side
   * counterpart to `uniqueDonationRecipients`. Counts unique sender
   * user_id, excludes burn / system sources (sender wallets without
   * a user_id) and self-donations (a user who somehow sent to their
   * own wallet does not increment the count). Used by the L2
   * dashboard to compute the "受領→送付 転換率" (recipient-to-sender
   * conversion rate) — share of DONATION recipients who have also
   * sent at least one DONATION — distinguishing reciprocal
   * participation networks from one-way distribution structures.
   */
  uniqueDonationSenders: Scalars['Int']['output'];
  /** User id. */
  userId: Scalars['ID']['output'];
  /**
   * Individual monthly-send rate: `donationOutMonths / monthsIn`, 0.0–1.0,
   * rounded to 3 decimals. INDIVIDUAL LTV variable (not the same as
   * communityActivityRate elsewhere in this schema).
   */
  userSendRate: Scalars['Float']['output'];
};

/** One month of community activity trend. */
export type GqlAnalyticsMonthlyActivityPoint = {
  __typename?: 'AnalyticsMonthlyActivityPoint';
  /**
   * Share of DONATION transactions that were part of a chain (chain_depth
   * > 0) in the month. 0.0–1.0.
   */
  chainPct?: Maybe<Scalars['Float']['output']>;
  /**
   * senderCount / month-end totalMembers. Read alongside newMembers: a
   * month with many new joiners can dip the rate even if absolute activity
   * grew.
   */
  communityActivityRate: Scalars['Float']['output'];
  /** Sum of DONATION points transferred in the month. */
  donationPointsSum: Scalars['Float']['output'];
  /**
   * Members who had no DONATION out in the trailing 30 days as of
   * the END of this month. Snapshot of the dormant base at
   * month-end. Pair with the NEXT month's `returnedMembers` to
   * compute the monthly recovery rate
   * (`returnedMembers[N] / dormantCount[N-1]`).
   *
   * Aligns with `AnalyticsCommunityOverview.dormantCount` /
   * `AnalyticsCommunityPayload.dormantCount` semantics: an
   * ever-donated member whose most recent DONATION is older than
   * 30 days as of the month-end timestamp. The latest month's
   * value should equal `AnalyticsCommunityPayload.dormantCount`
   * when `asOf` falls at or near the JST month-end, modulo the
   * difference between the request's `dormantThresholdDays` input
   * (which the trend ignores in favor of a fixed 30-day window so
   * monthly returnedMembers / dormantCount stay comparable across
   * requests).
   */
  dormantCount: Scalars['Int']['output'];
  /**
   * Distinct members who, AS OF the END of this month, had sent
   * DONATIONs to >= `hubBreadthThreshold` distinct recipients within
   * the trailing 28-day window ending at the month-end. Same
   * window-scoped semantic as
   * `AnalyticsCommunityOverview.hubMemberCount`, evaluated at
   * month-end rather than at request `asOf`.
   *
   * Window: `[monthEnd - 28 JST days, monthEnd)`. The 28-day window is
   * fixed (independent of any request input) so monthly
   * hubMemberCount values across the trend stay comparable to each
   * other — same precedent as `dormantCount`'s fixed 30-day window.
   * `hubBreadthThreshold` follows
   * `AnalyticsCommunityInput.hubBreadthThreshold` (default 3).
   *
   * Senders are restricted to users JOINED in the community at the
   * month-end timestamp — same membership filter as
   * `dormantCount` / L1 `senderCount` / L1 `hubMemberCount`. A
   * member who left the community before this month-end is
   * excluded even if they donated during the trailing window.
   *
   * When the L1 dashboard is queried with the default
   * `windowDays = 28` and an `asOf` that falls at or near a JST
   * month-end, the latest entry of `monthlyActivityTrend.hubMemberCount`
   * equals `AnalyticsCommunityOverview.hubMemberCount` for the same
   * community (provided both queries pass the same
   * `hubBreadthThreshold`).
   *
   * Currently always returns a non-null integer (0 for months with
   * no qualifying senders), matching the precedent set by sibling
   * monthly counters (`senderCount`, `dormantCount`). The field is
   * declared nullable to preserve forward compatibility for a future
   * refinement that may suppress months entirely outside the
   * community's MV data range — clients should still tolerate null.
   */
  hubMemberCount?: Maybe<Scalars['Int']['output']>;
  /** First day (JST) of the calendar month, e.g. 2025-10-01T00:00+09:00. */
  month: Scalars['Datetime']['output'];
  /** t_memberships.created_at (status='JOINED') rows falling in the month. */
  newMembers: Scalars['Int']['output'];
  /**
   * Members who were dormant at the END of the previous calendar
   * month but had at least one DONATION out in this month. Monthly
   * counterpart to `AnalyticsRetentionTrendPoint.returnedSenders`.
   * null for the first month in the series (no prior month to
   * reference).
   *
   * "Dormant at the end of previous month" uses the same threshold
   * semantic as `AnalyticsCommunityOverview.dormantCount` /
   * `AnalyticsMonthlyActivityPoint.dormantCount` — no DONATION out in
   * the trailing 30 days as of the previous month-end. This may
   * diverge slightly from the sum of weekly `returnedSenders` over
   * the month because the weekly metric uses a 12-week look-back at
   * ISO-week granularity while this monthly metric uses the
   * 30-day-trailing dormant snapshot at month-end. The discrepancy
   * is week/month boundary alignment only.
   */
  returnedMembers?: Maybe<Scalars['Int']['output']>;
  /** Distinct DONATION senders in the month. */
  senderCount: Scalars['Int']['output'];
};

/**
 * Platform-wide headline, computed by summing across every community in
 * scope for the caller (which is every community since this query is
 * SYS_ADMIN-gated).
 */
export type GqlAnalyticsPlatformSummary = {
  __typename?: 'AnalyticsPlatformSummary';
  /** Number of communities included in the response. */
  communitiesCount: Scalars['Int']['output'];
  /**
   * Sum of DONATION points transferred during the JST calendar month
   * containing `asOf`, across every community.
   */
  latestMonthDonationPoints: Scalars['Float']['output'];
  /** Sum of status='JOINED' members across every community. */
  totalMembers: Scalars['Int']['output'];
};

/** One ISO week of retention signals. */
export type GqlAnalyticsRetentionTrendPoint = {
  __typename?: 'AnalyticsRetentionTrendPoint';
  /** Senders in the prior week who did NOT send this week. */
  churnedSenders: Scalars['Int']['output'];
  /**
   * Community activity rate for the week: distinct senders / totalMembers
   * as of week end. null when the community had zero members during the
   * week.
   */
  communityActivityRate?: Maybe<Scalars['Float']['output']>;
  /** New t_memberships.created_at rows (status='JOINED') this week. */
  newMembers: Scalars['Int']['output'];
  /**
   * Senders in both the prior week and this week (same-user on
   * donation_out_count > 0).
   */
  retainedSenders: Scalars['Int']['output'];
  /**
   * Senders this week who did NOT send last week but DID send some week
   * in the prior 12-week window.
   */
  returnedSenders: Scalars['Int']['output'];
  /** Monday 00:00 JST of the ISO week. */
  week: Scalars['Datetime']['output'];
};

/**
 * Stage-count snapshot for one community, computed by the server using the
 * client-supplied `AnalyticsSegmentThresholdsInput`. Cumulative semantics:
 * `tier2Count` INCLUDES members counted in `tier1Count`.
 */
export type GqlAnalyticsSegmentCounts = {
  __typename?: 'AnalyticsSegmentCounts';
  /** Members with userSendRate > 0 (excludes latent). */
  activeCount: Scalars['Int']['output'];
  /** Members with donationOutMonths == 0 (latent / not-yet-participated). */
  passiveCount: Scalars['Int']['output'];
  /** Members with userSendRate >= tier1. */
  tier1Count: Scalars['Int']['output'];
  /** Members with userSendRate >= tier2 (includes tier1). */
  tier2Count: Scalars['Int']['output'];
  /** Total status='JOINED' members at asOf. */
  total: Scalars['Int']['output'];
};

/**
 * Stage classification thresholds, supplied by the client.
 * Thresholds define WHERE the boundary between stages sits, but naming
 * (habitual / regular / occasional / latent) remains fixed on the server.
 */
export type GqlAnalyticsSegmentThresholdsInput = {
  /**
   * Minimum tenure a member must have before being eligible for
   * tier1 / tier2 classification. Expressed in calendar months for
   * ergonomic operator-facing semantics, but evaluated internally as
   * `daysIn >= minMonthsIn × 30` so a member who joined yesterday
   * but happens to straddle a calendar-month boundary cannot sneak
   * past the filter. Filters out the short-tenure artifact where a
   * brand-new member who donated once gets
   * `userSendRate = 1/1 = 1.0` and is auto-classified as habitual
   * despite no actual track record.
   *
   * Only affects `tier1Count` and `tier2Count`; `activeCount`
   * ("ever donated") and `passiveCount` ("never donated") are
   * semantically tenure-independent and remain unfiltered.
   *
   * Default 1 → roughly "must have been around at least 30 days".
   * Set to 3 for "must have been around 3+ months (~90 days)" so
   * the operator-facing reading of `tier1Count` matches the
   * intuitive meaning of "habitual sender".
   *
   * Effective range 1..120; values outside are silently clamped on
   * the server. The 30-day-per-month conversion matches
   * `tenureDistribution`'s bucket boundaries so the stage classifier
   * and the tenure-distribution chart agree on what "1 month" means.
   */
  minMonthsIn?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Habitual stage threshold. A user with `userSendRate >= tier1` is
   * counted as "habitual" (i.e. sends donations in at least tier1 share
   * of their tenure). Default 0.7.
   */
  tier1?: InputMaybe<Scalars['Float']['input']>;
  /**
   * Regular stage threshold. `userSendRate >= tier2` AND `< tier1`
   * classifies as "regular". Default 0.4.
   */
  tier2?: InputMaybe<Scalars['Float']['input']>;
};

/** Sort direction for the member list. */
export const GqlAnalyticsSortOrder = {
  /**
   * Ascending — smallest value first (e.g. SEND_RATE ASC puts latent
   * and occasional members before habitual).
   */
  Asc: 'ASC',
  /**
   * Descending — largest value first (e.g. SEND_RATE DESC puts habitual
   * members at the top). This is the default.
   */
  Desc: 'DESC'
} as const;

export type GqlAnalyticsSortOrder = typeof GqlAnalyticsSortOrder[keyof typeof GqlAnalyticsSortOrder];
/**
 * Summary for one stage (habitual / regular / occasional / latent).
 * Stage membership is classified server-side using the thresholds supplied
 * in the request. `pointsContributionPct` is the share of total DONATION
 * points-out attributed to members in this stage, in the asOf month.
 */
export type GqlAnalyticsStageBucket = {
  __typename?: 'AnalyticsStageBucket';
  /** Average monthsIn across members in this stage. */
  avgMonthsIn: Scalars['Float']['output'];
  /** Average userSendRate across members in this stage (0.0–1.0). */
  avgSendRate: Scalars['Float']['output'];
  /** Number of members in this stage. */
  count: Scalars['Int']['output'];
  /** count / totalMembers (0.0–1.0). */
  pct: Scalars['Float']['output'];
  /**
   * Stage's share of this community's all-time DONATION points-out
   * (0.0–1.0). Numerator is the sum of `totalPointsOut` across the
   * stage's members; denominator is the same sum across all members.
   * 0 for the latent stage by definition.
   */
  pointsContributionPct: Scalars['Float']['output'];
};

/**
 * Four-stage distribution of the community's membership.
 * `pointsContributionPct` on `latent` is always 0 since latent members
 * haven't donated by definition.
 */
export type GqlAnalyticsStageDistribution = {
  __typename?: 'AnalyticsStageDistribution';
  /** userSendRate >= tier1. */
  habitual: GqlAnalyticsStageBucket;
  /** donationOutMonths == 0. */
  latent: GqlAnalyticsStageBucket;
  /** 0 < userSendRate < tier2. */
  occasional: GqlAnalyticsStageBucket;
  /** tier2 <= userSendRate < tier1. */
  regular: GqlAnalyticsStageBucket;
};

/**
 * Tenure-bucket distribution of a community's members at asOf,
 * classified on `daysIn` (JST calendar-day tenure). Lets the L1
 * dashboard surface community age structure (e.g. "lots of brand
 * new members, few established") without drilling into the L2
 * member list.
 *
 * Buckets are mutually exclusive and exhaustive; the sum equals
 * totalMembers. Boundaries are intentionally calendar-day rather
 * than month so a 28-day-tenure member doesn't get double-counted
 * into "1 month" purely because of `monthsIn`'s GREATEST(1, ...)
 * floor.
 */
export type GqlAnalyticsTenureDistribution = {
  __typename?: 'AnalyticsTenureDistribution';
  /**
   * Members with `daysIn >= 365` — long-time members. Combined
   * with `lt1Month`, signals the community's age structure.
   */
  gte12Months: Scalars['Int']['output'];
  /**
   * Members with `daysIn < 30` — newly joined cohort. Useful for
   * spotting communities flooded with new members where downstream
   * metrics (userSendRate, retention) are not yet meaningful.
   */
  lt1Month: Scalars['Int']['output'];
  /** Members with `30 <= daysIn < 90` — "still settling in" cohort. */
  m1to3Months: Scalars['Int']['output'];
  /** Members with `90 <= daysIn < 365` — established members. */
  m3to12Months: Scalars['Int']['output'];
  /**
   * Detailed monthly histogram for the L3 tenure deep-dive.
   *
   * Each entry counts currently-JOINED members whose `daysIn` falls
   * into the bucket. Bucket boundaries are aligned with the coarse
   * `gte12Months` cutoff so the histogram and coarse buckets agree:
   *
   *   - bucket 0:  daysIn <  30
   *   - bucket k (1..10):  k * 30 <= daysIn < (k + 1) * 30
   *   - bucket 11: 330 <= daysIn < 365
   *   - bucket 12: daysIn >= 365
   *
   * The 12 bucket therefore matches `gte12Months` exactly; bucket 11
   * is widened from the bare `[330, 360)` slot to `[330, 365)` so a
   * member at 360..364 days lands in 11 rather than 12
   * (`floor(daysIn / 30)` would otherwise have placed them in 12,
   * creating an asymmetry with the coarse `m3to12Months` cutoff at
   * 365).
   *
   * Returned in ascending bucket order (`monthsIn` 0..12), with every
   * bucket emitted (count = 0 for buckets with no members) so the
   * client can render a contiguous histogram axis without
   * zero-padding.
   *
   * Sum of `count` equals `totalMembers`. A member with `daysIn < 0`
   * (data anomaly — `daysIn` is floor-1-clamped at the SQL boundary
   * so this should be impossible) is clamped into bucket 0 rather
   * than excluded, matching the service implementation.
   *
   * The existing 4 coarse buckets (`lt1Month` / `m1to3Months` /
   * `m3to12Months` / `gte12Months`) remain for L1 / L2 callers; the
   * monthly histogram is additional, not a replacement.
   */
  monthlyHistogram: Array<GqlAnalyticsTenureHistogramBucket>;
};

/**
 * One bucket of the L3 tenure histogram. See
 * `AnalyticsTenureDistribution.monthlyHistogram`.
 */
export type GqlAnalyticsTenureHistogramBucket = {
  __typename?: 'AnalyticsTenureHistogramBucket';
  /** Number of currently-JOINED members in this bucket. */
  count: Scalars['Int']['output'];
  /**
   * Tenure bucket index, range 0..12. The 0 bucket aggregates
   * `daysIn < 30`; buckets 1..10 cover `k * 30 <= daysIn <
   * (k + 1) * 30`; bucket 11 covers `330 <= daysIn < 365`; the 12
   * bucket aggregates `daysIn >= 365` (matching the coarse
   * `gte12Months` boundary). Members at 330..364 days land in
   * bucket 11, not bucket 12.
   */
  monthsIn: Scalars['Int']['output'];
};

/**
 * Member-list filters for the L2 detail (`analyticsCommunity`).
 * All conditions AND together. Unspecified fields do not filter.
 */
export type GqlAnalyticsUserListFilter = {
  /** Inclusive upper bound on userSendRate. */
  maxSendRate?: InputMaybe<Scalars['Float']['input']>;
  /** Inclusive lower bound on donationOutMonths. */
  minDonationOutMonths?: InputMaybe<Scalars['Int']['input']>;
  /** Inclusive lower bound on monthsIn (JST-calendar months). */
  minMonthsIn?: InputMaybe<Scalars['Int']['input']>;
  /** Inclusive lower bound on userSendRate. Default 0.7 (habitual only). */
  minSendRate?: InputMaybe<Scalars['Float']['input']>;
};

/**
 * Sort configuration for the L2 member list. Both fields are optional;
 * omitting either falls back to the default (SEND_RATE DESC) so the
 * "top habitual members first" view renders out of the box.
 */
export type GqlAnalyticsUserListSort = {
  /**
   * Column to sort on. See AnalyticsUserSortField for what each value
   * addresses. Default: SEND_RATE.
   */
  field?: InputMaybe<GqlAnalyticsUserSortField>;
  /** Sort direction. Default: DESC. */
  order?: InputMaybe<GqlAnalyticsSortOrder>;
};

/** Sortable columns on the member list. */
export const GqlAnalyticsUserSortField = {
  /** donationOutMonths (distinct months with a DONATION out). */
  DonationOutMonths: 'DONATION_OUT_MONTHS',
  /** monthsIn (tenure in JST calendar months). */
  MonthsIn: 'MONTHS_IN',
  /** userSendRate (individual monthly-send rate, 0.0–1.0). */
  SendRate: 'SEND_RATE',
  /** totalPointsOut (lifetime DONATION points sent). */
  TotalPointsOut: 'TOTAL_POINTS_OUT'
} as const;

export type GqlAnalyticsUserSortField = typeof GqlAnalyticsUserSortField[keyof typeof GqlAnalyticsUserSortField];
/**
 * DONATION sender retention against the most recently completed
 * ISO week (Monday 00:00 JST). Raw signals only; the client composes
 * churn alerts (e.g. churnedSenders > retainedSenders).
 */
export type GqlAnalyticsWeeklyRetention = {
  __typename?: 'AnalyticsWeeklyRetention';
  /**
   * Users who sent DONATION in the week-before-latest but NOT in
   * the latest completed week. "Lost this week, was engaged last week."
   */
  churnedSenders: Scalars['Int']['output'];
  /**
   * Users who sent DONATION in the latest completed week AND in
   * the week before it. "Engaged this week, was engaged last week."
   */
  retainedSenders: Scalars['Int']['output'];
};

/**
 * DONATION activity within the parametric window driven by
 * `AnalyticsDashboardInput.windowDays`. Both the current window and
 * the immediately preceding window of equal length are returned so
 * the client can derive growth rates without a second query.
 *
 *   current  = [asOf - windowDays JST日, asOf + 1 JST日)
 *   previous = [asOf - 2 * windowDays, asOf - windowDays)
 */
export type GqlAnalyticsWindowActivity = {
  __typename?: 'AnalyticsWindowActivity';
  /**
   * New JOINED memberships (t_memberships.created_at within the
   * current window, status='JOINED').
   */
  newMemberCount: Scalars['Int']['output'];
  /** Same metric for the previous window. */
  newMemberCountPrev: Scalars['Int']['output'];
  /**
   * Users who sent at least one DONATION in BOTH the current window
   * AND the previous window (set intersection on user_id). Same
   * shape as AnalyticsWeeklyRetention.retainedSenders but at
   * windowDays scale, enabling client-side leaky-bucket derivation:
   *
   *   newlyActivatedSenders = senderCount     - retainedSenders
   *   churnedSenders        = senderCountPrev - retainedSenders
   */
  retainedSenders: Scalars['Int']['output'];
  /**
   * Unique users with at least one outgoing DONATION transaction
   * during the current window (donation_out_count > 0 in
   * mv_user_transaction_daily). Restricted to users who are still
   * JOINED in this community at asOf — a now-departed member who
   * donated during the window is excluded, mirroring the
   * membership filter on `totalMembers`.
   */
  senderCount: Scalars['Int']['output'];
  /**
   * Same metric for the previous window of equal length. Same
   * JOINED-at-asOf membership restriction applies (so the
   * `senderCount` / `senderCountPrev` comparison stays
   * apples-to-apples even when membership churn happens between
   * the two windows).
   */
  senderCountPrev: Scalars['Int']['output'];
};

/**
 * chain anchor のライフサイクル状態 (§4.1, §F)。
 * - PENDING: DB 永続化済み、weekly anchor batch 未投入
 * - SUBMITTED: Cardano tx 送信済み、未確定
 * - CONFIRMED: tx finalized
 * - FAILED: tx 失敗 / 再送対象
 */
export const GqlAnchorStatus = {
  Confirmed: 'CONFIRMED',
  Failed: 'FAILED',
  Pending: 'PENDING',
  Submitted: 'SUBMITTED'
} as const;

export type GqlAnchorStatus = typeof GqlAnchorStatus[keyof typeof GqlAnchorStatus];
export type GqlApproveReportPayload = GqlApproveReportSuccess;

export type GqlApproveReportSuccess = {
  __typename?: 'ApproveReportSuccess';
  report: GqlReport;
};

export type GqlArticle = {
  __typename?: 'Article';
  authors?: Maybe<Array<GqlUser>>;
  body?: Maybe<Scalars['String']['output']>;
  category: GqlArticleCategory;
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  introduction: Scalars['String']['output'];
  opportunities?: Maybe<Array<GqlOpportunity>>;
  publishStatus: GqlPublishStatus;
  publishedAt?: Maybe<Scalars['Datetime']['output']>;
  relatedUsers?: Maybe<Array<GqlUser>>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export const GqlArticleCategory = {
  ActivityReport: 'ACTIVITY_REPORT',
  Interview: 'INTERVIEW'
} as const;

export type GqlArticleCategory = typeof GqlArticleCategory[keyof typeof GqlArticleCategory];
export type GqlArticleCreateInput = {
  authorIds: Array<Scalars['ID']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
  category: GqlArticleCategory;
  introduction: Scalars['String']['input'];
  publishStatus: GqlPublishStatus;
  relatedOpportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  relatedUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  thumbnail?: InputMaybe<GqlImageInput>;
  title: Scalars['String']['input'];
};

export type GqlArticleCreatePayload = GqlArticleCreateSuccess;

export type GqlArticleCreateSuccess = {
  __typename?: 'ArticleCreateSuccess';
  article: GqlArticle;
};

export type GqlArticleDeletePayload = GqlArticleDeleteSuccess;

export type GqlArticleDeleteSuccess = {
  __typename?: 'ArticleDeleteSuccess';
  articleId: Scalars['ID']['output'];
};

export type GqlArticleEdge = GqlEdge & {
  __typename?: 'ArticleEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlArticle>;
};

export type GqlArticleFilterInput = {
  and?: InputMaybe<Array<GqlArticleFilterInput>>;
  authors?: InputMaybe<Array<Scalars['ID']['input']>>;
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
  communityId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['Datetime']['input']>;
  dateTo?: InputMaybe<Scalars['Datetime']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<GqlArticleFilterInput>;
  or?: InputMaybe<Array<GqlArticleFilterInput>>;
  publishStatus?: InputMaybe<Array<GqlPublishStatus>>;
  relatedUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  stateCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlArticleSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  publishedAt?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlArticleUpdateContentInput = {
  authorIds: Array<Scalars['ID']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
  category: GqlArticleCategory;
  introduction: Scalars['String']['input'];
  publishStatus: GqlPublishStatus;
  publishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  relatedOpportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  relatedUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  thumbnail?: InputMaybe<GqlImageInput>;
  title: Scalars['String']['input'];
};

export type GqlArticleUpdateContentPayload = GqlArticleUpdateContentSuccess;

export type GqlArticleUpdateContentSuccess = {
  __typename?: 'ArticleUpdateContentSuccess';
  article: GqlArticle;
};

export type GqlArticlesConnection = {
  __typename?: 'ArticlesConnection';
  edges?: Maybe<Array<Maybe<GqlArticleEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlAuthZDirectiveCompositeRulesInput = {
  and?: InputMaybe<Array<InputMaybe<GqlAuthZRules>>>;
  not?: InputMaybe<GqlAuthZRules>;
  or?: InputMaybe<Array<InputMaybe<GqlAuthZRules>>>;
};

export type GqlAuthZDirectiveDeepCompositeRulesInput = {
  and?: InputMaybe<Array<InputMaybe<GqlAuthZDirectiveDeepCompositeRulesInput>>>;
  id?: InputMaybe<GqlAuthZRules>;
  not?: InputMaybe<GqlAuthZDirectiveDeepCompositeRulesInput>;
  or?: InputMaybe<Array<InputMaybe<GqlAuthZDirectiveDeepCompositeRulesInput>>>;
};

export const GqlAuthZRules = {
  CanManageOpportunity: 'CanManageOpportunity',
  IsAdmin: 'IsAdmin',
  IsCommunityManager: 'IsCommunityManager',
  IsCommunityMember: 'IsCommunityMember',
  IsCommunityOwner: 'IsCommunityOwner',
  IsSelf: 'IsSelf',
  IsUser: 'IsUser'
} as const;

export type GqlAuthZRules = typeof GqlAuthZRules[keyof typeof GqlAuthZRules];
/** chain network 識別子 (§4.1)。Phase 1 は Cardano のみサポート。 */
export const GqlChainNetwork = {
  CardanoMainnet: 'CARDANO_MAINNET',
  CardanoPreprod: 'CARDANO_PREPROD'
} as const;

export type GqlChainNetwork = typeof GqlChainNetwork[keyof typeof GqlChainNetwork];
export type GqlCheckCommunityPermissionInput = {
  communityId: Scalars['ID']['input'];
};

export type GqlCheckIsSelfPermissionInput = {
  userId: Scalars['ID']['input'];
};

export type GqlCheckOpportunityPermissionInput = {
  communityId: Scalars['ID']['input'];
  opportunityId: Scalars['ID']['input'];
};

export type GqlCitiesConnection = {
  __typename?: 'CitiesConnection';
  edges: Array<GqlCityEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlCitiesInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCitiesSortInput = {
  code?: InputMaybe<GqlSortDirection>;
};

export type GqlCity = {
  __typename?: 'City';
  code: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  state?: Maybe<GqlState>;
};

export type GqlCityEdge = GqlEdge & {
  __typename?: 'CityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlCity>;
};

export const GqlClaimLinkStatus = {
  Claimed: 'CLAIMED',
  Expired: 'EXPIRED',
  Issued: 'ISSUED'
} as const;

export type GqlClaimLinkStatus = typeof GqlClaimLinkStatus[keyof typeof GqlClaimLinkStatus];
export type GqlCommonDocumentOverrides = {
  __typename?: 'CommonDocumentOverrides';
  privacy?: Maybe<GqlCommunityDocument>;
  terms?: Maybe<GqlCommunityDocument>;
};

export type GqlCommonDocumentOverridesInput = {
  privacy?: InputMaybe<GqlCommunityDocumentInput>;
  terms?: InputMaybe<GqlCommunityDocumentInput>;
};

export type GqlCommunitiesConnection = {
  __typename?: 'CommunitiesConnection';
  edges?: Maybe<Array<GqlCommunityEdge>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlCommunity = {
  __typename?: 'Community';
  articles?: Maybe<Array<GqlArticle>>;
  bio?: Maybe<Scalars['String']['output']>;
  config?: Maybe<GqlCommunityConfig>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  establishedAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  memberships?: Maybe<Array<GqlMembership>>;
  name?: Maybe<Scalars['String']['output']>;
  opportunities?: Maybe<Array<GqlOpportunity>>;
  participations?: Maybe<Array<GqlParticipation>>;
  places?: Maybe<Array<GqlPlace>>;
  pointName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utilities?: Maybe<Array<GqlUtility>>;
  wallets?: Maybe<Array<GqlWallet>>;
  website?: Maybe<Scalars['String']['output']>;
};

export type GqlCommunityConfig = {
  __typename?: 'CommunityConfig';
  firebaseConfig?: Maybe<GqlCommunityFirebaseConfig>;
  lineConfig?: Maybe<GqlCommunityLineConfig>;
  signupBonusConfig?: Maybe<GqlCommunitySignupBonusConfig>;
};

export type GqlCommunityConfigInput = {
  lineConfig?: InputMaybe<GqlCommunityLineConfigInput>;
  portalConfig?: InputMaybe<GqlCommunityPortalConfigInput>;
};

export type GqlCommunityCreateInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  config?: InputMaybe<GqlCommunityConfigInput>;
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  originalId?: InputMaybe<Scalars['String']['input']>;
  pointName: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunityCreatePayload = GqlCommunityCreateSuccess;

export type GqlCommunityCreateSuccess = {
  __typename?: 'CommunityCreateSuccess';
  community: GqlCommunity;
};

export type GqlCommunityDeletePayload = GqlCommunityDeleteSuccess;

export type GqlCommunityDeleteSuccess = {
  __typename?: 'CommunityDeleteSuccess';
  communityId: Scalars['String']['output'];
};

export type GqlCommunityDocument = {
  __typename?: 'CommunityDocument';
  id: Scalars['String']['output'];
  order?: Maybe<Scalars['Int']['output']>;
  path: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type GqlCommunityDocumentInput = {
  id: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  path: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type GqlCommunityEdge = GqlEdge & {
  __typename?: 'CommunityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlCommunity>;
};

export type GqlCommunityFilterInput = {
  cityCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  placeIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlCommunityFirebaseConfig = {
  __typename?: 'CommunityFirebaseConfig';
  tenantId?: Maybe<Scalars['String']['output']>;
};

export type GqlCommunityLineConfig = {
  __typename?: 'CommunityLineConfig';
  accessToken?: Maybe<Scalars['String']['output']>;
  channelId?: Maybe<Scalars['String']['output']>;
  channelSecret?: Maybe<Scalars['String']['output']>;
  liffAppId?: Maybe<Scalars['String']['output']>;
  liffBaseUrl?: Maybe<Scalars['String']['output']>;
  liffId?: Maybe<Scalars['String']['output']>;
  richMenus?: Maybe<Array<GqlCommunityLineRichMenuConfig>>;
};

export type GqlCommunityLineConfigInput = {
  accessToken: Scalars['String']['input'];
  channelId: Scalars['String']['input'];
  channelSecret: Scalars['String']['input'];
  liffAppId?: InputMaybe<Scalars['String']['input']>;
  liffBaseUrl: Scalars['String']['input'];
  liffId: Scalars['String']['input'];
  richMenus: Array<GqlCommunityLineRichMenuConfigInput>;
};

export type GqlCommunityLineRichMenuConfig = {
  __typename?: 'CommunityLineRichMenuConfig';
  richMenuId: Scalars['String']['output'];
  type: GqlLineRichMenuType;
};

export type GqlCommunityLineRichMenuConfigInput = {
  richMenuId: Scalars['String']['input'];
  type: GqlLineRichMenuType;
};

export type GqlCommunityPortalConfig = {
  __typename?: 'CommunityPortalConfig';
  adminRootPath: Scalars['String']['output'];
  commonDocumentOverrides?: Maybe<GqlCommonDocumentOverrides>;
  communityId: Scalars['String']['output'];
  description: Scalars['String']['output'];
  documents?: Maybe<Array<GqlCommunityDocument>>;
  domain: Scalars['String']['output'];
  enableFeatures: Array<Scalars['String']['output']>;
  faviconPrefix: Scalars['String']['output'];
  firebaseTenantId?: Maybe<Scalars['String']['output']>;
  liffAppId?: Maybe<Scalars['String']['output']>;
  liffBaseUrl?: Maybe<Scalars['String']['output']>;
  liffId?: Maybe<Scalars['String']['output']>;
  logoPath: Scalars['String']['output'];
  ogImagePath: Scalars['String']['output'];
  regionKey?: Maybe<Scalars['String']['output']>;
  regionName?: Maybe<Scalars['String']['output']>;
  rootPath: Scalars['String']['output'];
  shortDescription?: Maybe<Scalars['String']['output']>;
  squareLogoPath: Scalars['String']['output'];
  title: Scalars['String']['output'];
  tokenName: Scalars['String']['output'];
};

export type GqlCommunityPortalConfigInput = {
  adminRootPath?: InputMaybe<Scalars['String']['input']>;
  commonDocumentOverrides?: InputMaybe<GqlCommonDocumentOverridesInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  documents?: InputMaybe<Array<GqlCommunityDocumentInput>>;
  domain?: InputMaybe<Scalars['String']['input']>;
  enableFeatures?: InputMaybe<Array<Scalars['String']['input']>>;
  favicon?: InputMaybe<GqlImageInput>;
  /** @deprecated Use favicon instead */
  faviconPrefix?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<GqlImageInput>;
  /** @deprecated Use logo instead */
  logoPath?: InputMaybe<Scalars['String']['input']>;
  ogImage?: InputMaybe<GqlImageInput>;
  /** @deprecated Use ogImage instead */
  ogImagePath?: InputMaybe<Scalars['String']['input']>;
  regionKey?: InputMaybe<Scalars['String']['input']>;
  regionName?: InputMaybe<Scalars['String']['input']>;
  rootPath?: InputMaybe<Scalars['String']['input']>;
  shortDescription?: InputMaybe<Scalars['String']['input']>;
  squareLogo?: InputMaybe<GqlImageInput>;
  /** @deprecated Use squareLogo instead */
  squareLogoPath?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  tokenName?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunitySignupBonusConfig = {
  __typename?: 'CommunitySignupBonusConfig';
  bonusPoint: Scalars['Int']['output'];
  isEnabled: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
};

export type GqlCommunitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlCommunityUpdateProfileInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  pointName: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunityUpdateProfilePayload = GqlCommunityUpdateProfileSuccess;

export type GqlCommunityUpdateProfileSuccess = {
  __typename?: 'CommunityUpdateProfileSuccess';
  community: GqlCommunity;
};

export type GqlCreateUserDidInput = {
  /** 対象 chain network。未指定時は CARDANO_MAINNET (§5.2.1)。 */
  network?: InputMaybe<GqlChainNetwork>;
  userId: Scalars['ID']['input'];
};

export type GqlCurrentPointView = {
  __typename?: 'CurrentPointView';
  currentPoint: Scalars['BigInt']['output'];
  walletId?: Maybe<Scalars['String']['output']>;
};

export const GqlCurrentPrefecture = {
  Ehime: 'EHIME',
  Kagawa: 'KAGAWA',
  Kochi: 'KOCHI',
  OutsideShikoku: 'OUTSIDE_SHIKOKU',
  Tokushima: 'TOKUSHIMA',
  Unknown: 'UNKNOWN'
} as const;

export type GqlCurrentPrefecture = typeof GqlCurrentPrefecture[keyof typeof GqlCurrentPrefecture];
export type GqlCurrentUserPayload = {
  __typename?: 'CurrentUserPayload';
  user?: Maybe<GqlUser>;
};

export type GqlDateTimeRangeFilter = {
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
};

export type GqlDidIssuanceRequest = {
  __typename?: 'DidIssuanceRequest';
  completedAt?: Maybe<Scalars['Datetime']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  didValue?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  processedAt?: Maybe<Scalars['Datetime']['output']>;
  requestedAt?: Maybe<Scalars['Datetime']['output']>;
  status: GqlDidIssuanceStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export const GqlDidIssuanceStatus = {
  Completed: 'COMPLETED',
  Failed: 'FAILED',
  Pending: 'PENDING',
  Processing: 'PROCESSING'
} as const;

export type GqlDidIssuanceStatus = typeof GqlDidIssuanceStatus[keyof typeof GqlDidIssuanceStatus];
/**
 * DID lifecycle 操作種別 (§4.1)。
 * - CREATE: 初回作成
 * - UPDATE: 既存 DID Document の差し替え
 * - DEACTIVATE: tombstone (§E)
 */
export const GqlDidOperation = {
  Create: 'CREATE',
  Deactivate: 'DEACTIVATE',
  Update: 'UPDATE'
} as const;

export type GqlDidOperation = typeof GqlDidOperation[keyof typeof GqlDidOperation];
export type GqlEdge = {
  cursor: Scalars['String']['output'];
};

export type GqlError = {
  __typename?: 'Error';
  code: GqlErrorCode;
  message: Scalars['String']['output'];
};

export const GqlErrorCode = {
  AlreadyEvaluated: 'ALREADY_EVALUATED',
  AlreadyJoined: 'ALREADY_JOINED',
  AlreadyStartedReservation: 'ALREADY_STARTED_RESERVATION',
  AlreadyUsedClaimLink: 'ALREADY_USED_CLAIM_LINK',
  CannotEvaluateBeforeOpportunityStart: 'CANNOT_EVALUATE_BEFORE_OPPORTUNITY_START',
  ClaimLinkExpired: 'CLAIM_LINK_EXPIRED',
  ConcurrentRetryDetected: 'CONCURRENT_RETRY_DETECTED',
  Forbidden: 'FORBIDDEN',
  IncentiveDisabled: 'INCENTIVE_DISABLED',
  InsufficientBalance: 'INSUFFICIENT_BALANCE',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
  InvalidGrantStatus: 'INVALID_GRANT_STATUS',
  InvalidTransferMethod: 'INVALID_TRANSFER_METHOD',
  MissingWalletInformation: 'MISSING_WALLET_INFORMATION',
  NotFound: 'NOT_FOUND',
  NoAvailableParticipationSlots: 'NO_AVAILABLE_PARTICIPATION_SLOTS',
  PersonalRecordOnlyDeletable: 'PERSONAL_RECORD_ONLY_DELETABLE',
  RateLimit: 'RATE_LIMIT',
  ReservationAdvanceBookingRequired: 'RESERVATION_ADVANCE_BOOKING_REQUIRED',
  ReservationCancellationTimeout: 'RESERVATION_CANCELLATION_TIMEOUT',
  ReservationFull: 'RESERVATION_FULL',
  ReservationNotAccepted: 'RESERVATION_NOT_ACCEPTED',
  SlotNotScheduled: 'SLOT_NOT_SCHEDULED',
  TicketParticipantMismatch: 'TICKET_PARTICIPANT_MISMATCH',
  Unauthenticated: 'UNAUTHENTICATED',
  Unknown: 'UNKNOWN',
  UnsupportedGrantType: 'UNSUPPORTED_GRANT_TYPE',
  UnsupportedTransactionReason: 'UNSUPPORTED_TRANSACTION_REASON',
  ValidationError: 'VALIDATION_ERROR',
  VoteTopicNotEditable: 'VOTE_TOPIC_NOT_EDITABLE'
} as const;

export type GqlErrorCode = typeof GqlErrorCode[keyof typeof GqlErrorCode];