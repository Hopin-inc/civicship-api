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
}

/**
 * AI-facing community snapshot. `active_rate` is `active_users_in_window /
 * total_members` (null when the community has no JOINED members yet, so the
 * LLM does not emit a divide-by-zero ratio). `custom_context` is a free-text
 * markdown field sourced from `ReportTemplate.communityContext`, piped
 * through untouched so editors can steer tone / vision / references without
 * a schema change.
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
