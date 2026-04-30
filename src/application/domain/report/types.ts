// ---------------------------------------------------------------------------
// Report domain types
//
// Shared type contracts for the report domain that live above the data layer
// (`data/type.ts` holds Prisma select shapes) and below the presentation
// layer. Keeping these here lets service / usecase code reason about AI-facing
// payloads and variant identifiers without reaching into `presenter.ts` or
// the GraphQL codegen output — both of which are outer layers per
// Clean Architecture.
// ---------------------------------------------------------------------------

/**
 * Report variants, mirroring the GraphQL `ReportVariant` enum. Kept as a
 * domain-layer constant so repositories / batches don't need to import
 * presentation-layer GraphQL types to reference a variant string.
 */
export const ReportVariant = {
  WeeklySummary: "WEEKLY_SUMMARY",
  PersonalRecap: "PERSONAL_RECAP",
  MemberNewsletter: "MEMBER_NEWSLETTER",
  GrantApplication: "GRANT_APPLICATION",
  MediaPr: "MEDIA_PR",
} as const;

export type ReportVariant = (typeof ReportVariant)[keyof typeof ReportVariant];

// ---------------------------------------------------------------------------
// AI-facing report payload types
//
// These are plain, JSON-serialisable shapes designed to be fed to an LLM as
// the dataset for report generation. Keep keys snake_case for LLM-friendly
// token boundaries, and convert BigInt to number (safe: point amounts fit
// well inside Number.MAX_SAFE_INTEGER for our scale).
// ---------------------------------------------------------------------------

export interface WeeklyReportPayload {
  period: { from: string; to: string };
  community_id: string;
  community_context: CommunityContext | null;
  deepest_chain: DeepestChainItem | null;
  daily_summaries: DailySummaryItem[];
  daily_active_users: DailyActiveUsersItem[];
  top_users: TopUserItem[];
  highlight_comments: CommentItem[];
  /**
   * Window-wide totals across all reasons. Pre-computed in the presenter so
   * prompt templates can reference `[aggregate.tx_count]` / `[aggregate.points_sum]`
   * without asking the LLM to sum daily_summaries — keeping arithmetic out of
   * the model is the core guard against fabricated headline numbers.
   */
  aggregate: {
    tx_count: number;
    points_sum: number;
  };
  /**
   * Per-reason totals keyed by the raw `TransactionReason` enum string.
   * The core reasons `DONATION` / `GRANT` / `ONBOARDING` are ALWAYS
   * present — pre-filled with zero on weeks where no transactions of
   * that kind occurred — so prompt placeholders like
   * `[aggregates_by_reason.DONATION.tx_count]` always resolve to a real
   * number. Without the prefill the key would be absent on quiet weeks,
   * the `[...]` copy-verbatim rule could not apply, and the LLM would be
   * free to invent the missing value. Other reasons (`POINT_ISSUED` /
   * `POINT_REWARD` / `TICKET_*` / `OPPORTUNITY_*`) appear only when they
   * actually occurred; the prompt rules instruct the model to leave
   * non-core reasons unmentioned. Templates omit a core-reason row only
   * when its `tx_count` is zero (i.e. nothing happened) — the key itself
   * is always there.
   */
  aggregates_by_reason: {
    [reason: string]: {
      tx_count: number;
      points_sum: number;
    };
  };
  /**
   * Day with the highest `active_users` count in the window. `null` when
   * `daily_active_users` is empty. Ties resolve to the earliest date so the
   * surfaced day is stable across runs.
   */
  peak_active_day: {
    date: string;
    active_users: number;
  } | null;
  /**
   * Display-formatted percentage string for `community_context.active_rate`,
   * one decimal place (e.g. `"3.4"`). `null` when `active_rate` is null
   * (community has no JOINED members). Pre-formatting in the presenter
   * removes the LLM's chance to misformat a 0..1 ratio as `"0.034%"` or
   * `"3%"`.
   */
  active_rate_pct: string | null;
  /**
   * Aggregates for the equal-length window immediately preceding `period`,
   * plus pre-computed week-over-week growth rates. Populated only when the
   * caller opts in via `includePreviousPeriod`; otherwise null so the LLM
   * prompt can key on presence.
   *
   * `growth_rate` fields are computed in the presenter (not the LLM) so
   * divide-by-zero cases land as `null` rather than `NaN` / `Infinity`
   * leaking into the prompt.
   */
  previous_period: PreviousPeriodSummary | null;
  /**
   * Cohort / retention signals for the reporting window. Populated only
   * when the caller opts in via `includeRetention`; otherwise null. The
   * LLM prompt keys on presence to decide whether to write retention
   * commentary at all.
   *
   * These counters are NOT mutually exclusive (see `RetentionSummary`
   * comment for the full caveat): a new member who immediately sends a
   * DONATION will count as both `new_members` and in the denominator of
   * active_rate_sender, so the prompt template must not sum them and
   * expect `active_users_in_window`.
   */
  retention: RetentionSummary | null;
}

/**
 * AI-facing community snapshot. `active_users_in_window` is DONATION-scoped
 * (distinct users with `donation_out_count > 0` or `received_donation_count
 * > 0` in the window) so the LLM reads peer-to-peer engagement, not a
 * figure inflated by system-issued ONBOARDING / GRANT transactions.
 * `active_rate` is `active_users_in_window / total_members` (null when the
 * community has no JOINED members yet, so the LLM does not emit a
 * divide-by-zero ratio). `custom_context` is a free-text markdown field
 * sourced from `ReportTemplate.communityContext`, piped through untouched
 * so editors can steer tone / vision / references without a schema change.
 */
export interface CommunityContext {
  community_id: string;
  name: string;
  point_name: string;
  bio: string | null;
  established_at: string | null;
  website: string | null;
  total_members: number;
  active_users_in_window: number;
  active_rate: number | null;
  custom_context: string | null;
}

export interface DeepestChainItem {
  transaction_id: string;
  chain_depth: number;
  reason: string;
  comment: string | null;
  date: string;
  from_user_id: string | null;
  to_user_id: string | null;
  created_by_user_id: string | null;
  parent_tx_id: string | null;
}

export interface DailySummaryItem {
  date: string;
  reason: string;
  tx_count: number;
  points_sum: number;
  chain_root_count: number;
  chain_descendant_count: number;
  max_chain_depth: number | null;
  avg_chain_depth: number | null;
  issuance_count: number;
  burn_count: number;
}

/**
 * Per-day DONATION-scoped distinct user counts. `senders` counts users
 * who sent at least one DONATION that day, `receivers` counts users who
 * received at least one DONATION that day, and `active_users` is the
 * union. Users whose only activity was receiving an admin-issued
 * ONBOARDING / GRANT are intentionally excluded — the peer-engagement
 * signal is what drives the narrative, not raw MV reach.
 */
export interface DailyActiveUsersItem {
  date: string;
  active_users: number;
  senders: number;
  receivers: number;
}

export interface TopUserItem {
  user_id: string;
  name: string;
  user_bio: string | null;
  membership_bio: string | null;
  headline: string | null;
  role: string;
  joined_at: string;
  days_since_joined: number;
  tx_count_in: number;
  tx_count_out: number;
  points_in: number;
  points_out: number;
  donation_out_count: number;
  donation_out_points: number;
  received_donation_count: number;
  chain_root_count: number;
  max_chain_depth_started: number | null;
  chain_depth_reached_max: number | null;
  /**
   * Sum of per-day distinct counterparty counts across the reporting window.
   * NOT a deduplicated count of distinct counterparties for the period — the
   * same counterparty appearing on multiple days is counted once per day.
   */
  unique_counterparties_sum: number;
  /**
   * True distinct *outgoing* counterparty count across the whole reporting
   * window — how many different people this user sent to, deduplicated
   * over the full period (a counterparty appearing on multiple days counts
   * once).
   *
   * Asymmetric with `unique_counterparties_sum`: the `sum` field is sourced
   * from `mv_user_transaction_daily` and counts per-day distincts across
   * BOTH in and out directions, whereas this field is computed from the
   * reporting-window slice of `t_transactions` and covers the OUTGOING
   * direction only (and excludes self-transfers). The two are *not* a
   * pure "per-day-duplicated vs period-deduplicated" pair — a user with
   * mostly incoming activity will show a large `sum` and a small `true`
   * purely from the directional asymmetry, not from overlap. Prompt
   * authors reading both fields together must account for this before
   * narrating any "breadth vs depth" intuition.
   *
   * Scoped to the top-N users — the target is always a short list of ≤ a
   * few dozen user ids per community-week so the direct aggregation does
   * not need an MV. `null` when the repository returned no row for the
   * user (e.g. receiver with zero outgoing activity).
   */
  true_unique_counterparties: number | null;
}

/**
 * Aggregate stats for the window immediately preceding the report period,
 * used to drive "this week vs last week" narrative. The stat set is a
 * deliberate subset of the current-period payload — only the counters the
 * LLM needs for high-level growth commentary.
 *
 * `active_users_in_window` uses the same DONATION-scoped definition as
 * `CommunityContext.active_users_in_window` so `growth_rate.active_users`
 * compares the two windows on a consistent peer-engagement frame.
 *
 * `new_members` uses `t_memberships.created_at` to match `RetentionSummary`
 * (and not `ONBOARDING` transactions, which have operational noise around
 * re-issuance timing).
 */
export interface PreviousPeriodSummary {
  period: { from: string; to: string };
  active_users_in_window: number;
  total_tx_count: number;
  total_points_sum: number;
  new_members: number;
  /**
   * Percent week-over-week change, pre-computed. `null` when the previous
   * period's denominator was zero (nothing to compare against) so the LLM
   * is never asked to divide by zero.
   *
   * `active_users` is additionally `null` when `community_context` is
   * null: without the current-window active-user count (which lives on
   * that block), we have no DONATION-scoped numerator to compare against
   * the previous window and refuse to fabricate one from a
   * different-frame proxy.
   */
  growth_rate: {
    active_users: number | null;
    tx_count: number | null;
    points_sum: number | null;
  };
}

/**
 * Retention / cohort snapshot for the reporting window. Signal definitions
 * use the `is_sender` frame (i.e. DONATION-sent that week) rather than
 * "any activity" because receiver-only weeks are a weaker engagement
 * signal and the prompt needs the stronger "did this person actively
 * contribute" semantic.
 *
 * Category overlaps (documented here so prompt authors don't sum them):
 *   - `new_members` and `retained_senders` are mutually exclusive: a new
 *     member has no prior-week activity by definition, so even if they
 *     send a donation their first week they land in `current_senders_count`
 *     only — not in `retained_senders`, which requires `is_sender` on
 *     BOTH the current and previous weeks.
 *   - `active_rate_any` counts DONATION-receivers in the numerator; the
 *     other rates use the `is_sender` frame. Both sender and receiver
 *     signals are DONATION-scoped (not `tx_count_in/out > 0`), so
 *     ONBOARDING / GRANT noise does not inflate the rate on either side.
 *   - `returned_senders` is bounded to a 12-week lookback; someone
 *     returning after 13+ weeks of silence lands in none of the buckets.
 *
 * Week1 / Week4 retention are based on the cohort that joined exactly
 * N weeks ago (not all cohorts). `null` when no such cohort exists yet
 * (e.g. the community is too young), to avoid "0/0 = 0%" masquerading
 * as genuine zero retention.
 */
export interface RetentionSummary {
  new_members: number;
  retained_senders: number;
  returned_senders: number;
  churned_senders: number;
  active_rate_sender: number | null;
  active_rate_any: number | null;
  week1_retention: number | null;
  week4_retention: number | null;
}

export interface CommentItem {
  transaction_id: string;
  date: string;
  reason: string;
  points: number;
  comment: string;
  from_user_id: string | null;
  to_user_id: string | null;
  created_by_user_id: string | null;
  chain_depth: number | null;
}
