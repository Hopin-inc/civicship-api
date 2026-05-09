import { ReportStatus } from "@prisma/client";
import { prismaClient } from "@/infrastructure/prisma/client";
import { GqlReportVariant } from "@/types/graphql";
import type { WeeklyReportPayload } from "@/application/domain/report/types";

/**
 * Frozen golden dataset for the WEEKLY_SUMMARY judge harness. Each
 * case is a (payloadFixture, judgeCriteria, minJudgeScore) triple the
 * CI script regenerates against the live prompt + judge stack on every
 * change. Failures here mean either the generation prompt regressed,
 * the judge prompt regressed, or both — the breakdown returned by the
 * judge tells which.
 *
 * Cases are intentionally small (3): the dataset's job is to detect
 * regressions, not exhaustively cover every shape. Add more cases when
 * production reveals a category of error the existing three do not
 * surface.
 */

interface GoldenCaseDefinition {
  variant: GqlReportVariant;
  label: string;
  payloadFixture: WeeklyReportPayload;
  judgeCriteria: { items: string[] };
  minJudgeScore: number;
  forbiddenKeys: string[];
  notes?: string;
  /**
   * Discriminates "expected to reach DRAFT/PUBLISHED" (undefined /
   * null) from "expected to short-circuit to SKIPPED" (set to
   * `ReportStatus.SKIPPED`). The CI harness branches on this rather
   * than the previous `minJudgeScore === 0` sentinel — see the schema
   * comment on ReportGoldenCase for rationale.
   */
  expectedStatus?: ReportStatus;
  /**
   * Template version this case targets (see ReportGoldenCase schema
   * comment).
   * - undefined / null: shared baseline — runs on every CI invocation.
   *   Criteria must be satisfiable by every coexisting prompt version.
   * - N (integer): runs ONLY when `--version=N` is passed to the CI
   *   harness. Use for criteria specific to one prompt version that
   *   would incorrectly fail earlier versions.
   */
  templateVersion?: number;
}

// ---------------------------------------------------------------------------
// Case 1: sparse-but-meaningful
//
// Three active members, two DONATION transactions, one chain that
// reaches depth 9. The point of this case is NOT to test that the
// model can write a report on lots of data — it is to test that the
// model does NOT FABRICATE additional activity to fill space. The
// `forbiddenKeys` list catches the most common confabulation tells
// observed in spike testing: "[placeholder]", week-over-week
// comparisons (no prior week is in the payload), and references to
// upcoming events (no events are in the payload).
// ---------------------------------------------------------------------------

const sparseCase: GoldenCaseDefinition = {
  variant: GqlReportVariant.WeeklySummary,
  label: "sparse-but-meaningful",
  minJudgeScore: 70,
  judgeCriteria: {
    items: [
      "少ないデータで架空の情報を捏造していないか",
      "実際のコメント内容を正確に引用しているか",
      "chain_depth の意味を正しく説明しているか",
      "具体的な推奨アクションが2件以上あるか",
    ],
  },
  forbiddenKeys: ["TODO", "[placeholder]", "先週比", "月末イベント"],
  notes:
    "active_users=3 / tx_count=2 / DONATION only / deepest_chain=9。fabrication 検出が主目的。",
  payloadFixture: {
    period: { from: "2026-04-10", to: "2026-04-16" },
    community_id: "test-sparse",
    community_context: {
      community_id: "test-sparse",
      name: "テストコミュニティ A",
      point_name: "pt",
      bio: "小規模コミュニティ",
      established_at: "2025-01-15",
      website: null,
      total_members: 28,
      active_users_in_window: 3,
      active_rate: 3 / 28,
      custom_context: null,
    },
    deepest_chain: {
      transaction_id: "tx-sparse-1",
      chain_depth: 9,
      reason: "DONATION",
      comment: "本当にありがとう。次の人にも繋ぎます。",
      date: "2026-04-14",
      from_user_id: "user-a",
      to_user_id: "user-b",
      created_by_user_id: "user-a",
      parent_tx_id: "tx-sparse-parent",
    },
    daily_summaries: [
      {
        date: "2026-04-12",
        reason: "DONATION",
        tx_count: 1,
        points_sum: 500,
        chain_root_count: 1,
        chain_descendant_count: 0,
        max_chain_depth: 1,
        avg_chain_depth: 1,
        issuance_count: 0,
        burn_count: 0,
      },
      {
        date: "2026-04-14",
        reason: "DONATION",
        tx_count: 1,
        points_sum: 800,
        chain_root_count: 0,
        chain_descendant_count: 1,
        max_chain_depth: 9,
        avg_chain_depth: 9,
        issuance_count: 0,
        burn_count: 0,
      },
    ],
    daily_active_users: [
      { date: "2026-04-12", active_users: 2, senders: 1, receivers: 1 },
      { date: "2026-04-14", active_users: 2, senders: 1, receivers: 1 },
    ],
    top_users: [
      {
        user_id: "user-a",
        name: "山田",
        user_bio: null,
        membership_bio: null,
        headline: null,
        role: "MEMBER",
        joined_at: "2025-08-01",
        days_since_joined: 258,
        tx_count_in: 0,
        tx_count_out: 1,
        points_in: 0,
        points_out: 800,
        donation_out_count: 1,
        donation_out_points: 800,
        received_donation_count: 0,
        chain_root_count: 0,
        max_chain_depth_started: null,
        chain_depth_reached_max: null,
        unique_counterparties_sum: 1,
        true_unique_counterparties: 1,
      },
      {
        user_id: "user-b",
        name: "佐藤",
        user_bio: null,
        membership_bio: null,
        headline: null,
        role: "MEMBER",
        joined_at: "2025-09-10",
        days_since_joined: 218,
        tx_count_in: 1,
        tx_count_out: 0,
        points_in: 800,
        points_out: 0,
        donation_out_count: 0,
        donation_out_points: 0,
        received_donation_count: 1,
        chain_root_count: 0,
        max_chain_depth_started: null,
        chain_depth_reached_max: 9,
        unique_counterparties_sum: 1,
        true_unique_counterparties: null,
      },
    ],
    highlight_comments: [
      {
        transaction_id: "tx-sparse-1",
        date: "2026-04-14",
        reason: "DONATION",
        points: 800,
        comment: "本当にありがとう。次の人にも繋ぎます。",
        from_user_id: "user-a",
        to_user_id: "user-b",
        created_by_user_id: "user-a",
        chain_depth: 9,
      },
    ],
    previous_period: null,
    retention: null,
    // Sums of the daily_summaries above (DONATION 1+1 / 500+800).
    // GRANT / ONBOARDING are pre-filled with zero so the prompt's
    // `[aggregates_by_reason.GRANT.tx_count]` placeholder still resolves
    // even though no transactions of those kinds occurred in the window.
    aggregate: { tx_count: 2, points_sum: 1300 },
    aggregates_by_reason: {
      DONATION: { tx_count: 2, points_sum: 1300 },
      GRANT: { tx_count: 0, points_sum: 0 },
      ONBOARDING: { tx_count: 0, points_sum: 0 },
    },
    // 04-12 and 04-14 both have active_users=2 → ties resolve to the earliest date.
    peak_active_day: { date: "2026-04-12", active_users: 2 },
    // 3 / 28 = 0.10714... → "10.7"
    active_rate_pct: "10.7",
  },
};

// ---------------------------------------------------------------------------
// Case 2: zero-activity
//
// Empty week. The CI harness must short-circuit on this case BEFORE
// invoking the judge — `evaluateSkipReason` should return non-null,
// generation should produce a SKIPPED row, and no LLM call should
// happen. `minJudgeScore: 0` reflects the fact that the judge is
// never invoked here; the harness uses the value as a "do not even
// try to score" sentinel.
// ---------------------------------------------------------------------------

const zeroActivityCase: GoldenCaseDefinition = {
  variant: GqlReportVariant.WeeklySummary,
  label: "zero-activity",
  // minJudgeScore is unused for SKIPPED-expected cases (the CI harness
  // never invokes the judge), but we keep it at 0 so a future
  // expectedStatus accidentally being cleared would not let the case
  // silently pass on a low-quality output.
  minJudgeScore: 0,
  expectedStatus: ReportStatus.SKIPPED,
  judgeCriteria: { items: [] },
  forbiddenKeys: [],
  notes:
    "SKIPPED 期待ケース。LLM が呼ばれず judge も実行されないことを CI で検証する。",
  payloadFixture: {
    period: { from: "2026-04-10", to: "2026-04-16" },
    community_id: "test-zero",
    community_context: {
      community_id: "test-zero",
      name: "テストコミュニティ B",
      point_name: "pt",
      bio: null,
      established_at: null,
      website: null,
      total_members: 100,
      active_users_in_window: 0,
      active_rate: 0,
      custom_context: null,
    },
    deepest_chain: null,
    daily_summaries: [],
    daily_active_users: [],
    top_users: [],
    highlight_comments: [],
    previous_period: null,
    retention: null,
    // Zero-activity case: aggregates collapse to zero/empty/null. Mirrors
    // exactly what the presenter would emit if buildReportPayload were
    // invoked against this state (it never is — evaluateSkipReason
    // short-circuits to SKIPPED before the LLM call). Core reasons are
    // pre-filled even here so the fixture matches the runtime payload
    // shape exactly.
    aggregate: { tx_count: 0, points_sum: 0 },
    aggregates_by_reason: {
      DONATION: { tx_count: 0, points_sum: 0 },
      GRANT: { tx_count: 0, points_sum: 0 },
      ONBOARDING: { tx_count: 0, points_sum: 0 },
    },
    peak_active_day: null,
    // active_rate is 0 (members exist, no activity) so the formatter
    // emits "0.0", not null. Null is reserved for the "no JOINED members"
    // edge case where active_rate is unset.
    active_rate_pct: "0.0",
  },
};

// ---------------------------------------------------------------------------
// Case 3: bustling-mixed-reason
//
// 34 active users, 54 transactions across DONATION / GRANT /
// ONBOARDING, deepest_chain=17. The point of this case is to test
// CATEGORY DISCRIMINATION: GRANT (admin-issued reward) is structurally
// different from DONATION (peer transfer), and a model that lumps them
// together produces misleading copy. The forbidden phrase
// "GRANT はメンバー間のドネーション" is the exact mistake observed in
// spike testing.
// ---------------------------------------------------------------------------

const bustlingCase: GoldenCaseDefinition = {
  variant: GqlReportVariant.WeeklySummary,
  label: "bustling-mixed-reason",
  minJudgeScore: 75,
  judgeCriteria: {
    items: [
      "DONATION / GRANT / ONBOARDING を別カテゴリとして区別しているか",
      "新規メンバー（ONBOARDING）への言及があるか",
      "GRANT を DONATION と混同していないか",
      "deepest_chain を感謝の連鎖として物語化しているか",
    ],
  },
  forbiddenKeys: ["GRANT はメンバー間のドネーション"],
  notes: "active_users=34 / tx_count=54 / 3 reasons 混在 / deepest_chain=17。category 弁別が主目的。",
  payloadFixture: {
    period: { from: "2026-04-10", to: "2026-04-16" },
    community_id: "test-bustling",
    community_context: {
      community_id: "test-bustling",
      name: "テストコミュニティ C",
      point_name: "pt",
      bio: "活発なコミュニティ",
      established_at: "2024-04-01",
      website: "https://example.com",
      total_members: 150,
      active_users_in_window: 34,
      active_rate: 34 / 150,
      custom_context: null,
    },
    deepest_chain: {
      transaction_id: "tx-bust-1",
      chain_depth: 17,
      reason: "DONATION",
      comment: "皆さんからの感謝が連鎖していて感動しました。",
      date: "2026-04-15",
      from_user_id: "user-x",
      to_user_id: "user-y",
      created_by_user_id: "user-x",
      parent_tx_id: "tx-bust-parent",
    },
    daily_summaries: [
      {
        date: "2026-04-11",
        reason: "DONATION",
        tx_count: 12,
        points_sum: 18500,
        chain_root_count: 3,
        chain_descendant_count: 9,
        max_chain_depth: 12,
        avg_chain_depth: 6,
        issuance_count: 0,
        burn_count: 0,
      },
      {
        date: "2026-04-13",
        reason: "GRANT",
        tx_count: 4,
        points_sum: 40000,
        chain_root_count: 0,
        chain_descendant_count: 0,
        max_chain_depth: null,
        avg_chain_depth: null,
        issuance_count: 4,
        burn_count: 0,
      },
      {
        date: "2026-04-13",
        reason: "ONBOARDING",
        tx_count: 5,
        points_sum: 5000,
        chain_root_count: 0,
        chain_descendant_count: 0,
        max_chain_depth: null,
        avg_chain_depth: null,
        issuance_count: 5,
        burn_count: 0,
      },
      {
        date: "2026-04-15",
        reason: "DONATION",
        tx_count: 33,
        points_sum: 62300,
        chain_root_count: 4,
        chain_descendant_count: 29,
        max_chain_depth: 17,
        avg_chain_depth: 8,
        issuance_count: 0,
        burn_count: 0,
      },
    ],
    daily_active_users: [
      { date: "2026-04-11", active_users: 14, senders: 8, receivers: 12 },
      { date: "2026-04-13", active_users: 9, senders: 4, receivers: 9 },
      { date: "2026-04-15", active_users: 28, senders: 16, receivers: 24 },
    ],
    top_users: [
      {
        user_id: "user-x",
        name: "鈴木",
        user_bio: null,
        membership_bio: "コミュニティ運営",
        headline: null,
        role: "MEMBER",
        joined_at: "2024-06-01",
        days_since_joined: 685,
        tx_count_in: 8,
        tx_count_out: 11,
        points_in: 12300,
        points_out: 19800,
        donation_out_count: 11,
        donation_out_points: 19800,
        received_donation_count: 8,
        chain_root_count: 4,
        max_chain_depth_started: 17,
        chain_depth_reached_max: 12,
        unique_counterparties_sum: 18,
        true_unique_counterparties: 9,
      },
      {
        user_id: "user-y",
        name: "高橋",
        user_bio: null,
        membership_bio: null,
        headline: null,
        role: "MEMBER",
        joined_at: "2025-02-10",
        days_since_joined: 432,
        tx_count_in: 5,
        tx_count_out: 6,
        points_in: 8200,
        points_out: 11000,
        donation_out_count: 6,
        donation_out_points: 11000,
        received_donation_count: 5,
        chain_root_count: 1,
        max_chain_depth_started: 8,
        chain_depth_reached_max: 17,
        unique_counterparties_sum: 11,
        true_unique_counterparties: 5,
      },
    ],
    highlight_comments: [
      {
        transaction_id: "tx-bust-1",
        date: "2026-04-15",
        reason: "DONATION",
        points: 1500,
        comment: "皆さんからの感謝が連鎖していて感動しました。",
        from_user_id: "user-x",
        to_user_id: "user-y",
        created_by_user_id: "user-x",
        chain_depth: 17,
      },
      {
        transaction_id: "tx-bust-2",
        date: "2026-04-13",
        reason: "ONBOARDING",
        points: 1000,
        comment: "新メンバー、ようこそ！",
        from_user_id: null,
        to_user_id: "user-new-1",
        created_by_user_id: "user-x",
        chain_depth: null,
      },
    ],
    previous_period: null,
    retention: null,
    // Sums across the four daily_summaries rows above:
    //   DONATION:  12+33 = 45 / 18500+62300 = 80800
    //   GRANT:        4       / 40000
    //   ONBOARDING:   5       / 5000
    //   total:       54       / 125800
    aggregate: { tx_count: 54, points_sum: 125800 },
    aggregates_by_reason: {
      DONATION: { tx_count: 45, points_sum: 80800 },
      GRANT: { tx_count: 4, points_sum: 40000 },
      ONBOARDING: { tx_count: 5, points_sum: 5000 },
    },
    // 04-15 has the largest active_users (28); 04-11 (14) and 04-13 (9)
    // are smaller, so no tie.
    peak_active_day: { date: "2026-04-15", active_users: 28 },
    // 34 / 150 = 0.22666... → "22.7"
    active_rate_pct: "22.7",
  },
};

// ---------------------------------------------------------------------------
// v2-specific cases (templateVersion=2)
//
// These only run when `pnpm ci:report-golden -- --version=2` is invoked.
// They reuse the same payload fixtures as the shared baseline but hold
// criteria that are specific to the v2 prompt — putting them in the
// shared set would incorrectly fail v1 (see PR-F5 §7).
//
// v2 differs from v1 in three testable ways:
//   1. deepest_chain is moved to the opening hook with the numeric
//      chain_depth surfaced explicitly.
//   2. Week-over-week comparisons are explicitly forbidden (the
//      payload contains no prior-week data to compare against).
//   3. `point_name` (e.g. "pt") must be used instead of the generic
//      word "ポイント".
// ---------------------------------------------------------------------------

const sparseCaseV2: GoldenCaseDefinition = {
  variant: GqlReportVariant.WeeklySummary,
  label: "sparse-but-meaningful-v2",
  minJudgeScore: 70,
  templateVersion: 2,
  judgeCriteria: {
    items: [
      "deepest_chain に chain_depth の数値を含めて言及しているか",
      "前週比・先週比への言及がないか",
    ],
  },
  forbiddenKeys: ["TODO", "[placeholder]", "先週比", "前週比", "月末イベント"],
  notes:
    "v2 専用。sparse payload を v2 プロンプトで評価し、chain_depth の数値言及と前週比禁止を検証する。",
  payloadFixture: sparseCase.payloadFixture,
};

const bustlingCaseV2: GoldenCaseDefinition = {
  variant: GqlReportVariant.WeeklySummary,
  label: "bustling-mixed-reason-v2",
  minJudgeScore: 75,
  templateVersion: 2,
  judgeCriteria: {
    items: [
      "deepest_chain を冒頭またはセクション見出しレベルで言及しているか",
      "前週比・先週比への言及がないか",
      "point_name（固有のポイント名）を使っているか（「ポイント」と書いていないか）",
    ],
  },
  forbiddenKeys: ["GRANT はメンバー間のドネーション", "先週比", "前週比"],
  notes:
    "v2 専用。bustling payload を v2 プロンプトで評価し、deepest_chain の配置・前週比禁止・point_name 使用を検証する。",
  payloadFixture: bustlingCase.payloadFixture,
};

const GOLDEN_CASES: GoldenCaseDefinition[] = [
  sparseCase,
  zeroActivityCase,
  bustlingCase,
  sparseCaseV2,
  bustlingCaseV2,
];

export async function seedReportGoldenCases() {
  await prismaClient.$transaction(async (tx) => {
    for (const c of GOLDEN_CASES) {
      await tx.reportGoldenCase.upsert({
        where: { variant_label: { variant: c.variant, label: c.label } },
        create: {
          variant: c.variant,
          label: c.label,
          payloadFixture: c.payloadFixture as unknown as object,
          judgeCriteria: c.judgeCriteria as unknown as object,
          minJudgeScore: c.minJudgeScore,
          forbiddenKeys: c.forbiddenKeys,
          notes: c.notes ?? null,
          expectedStatus: c.expectedStatus ?? null,
          templateVersion: c.templateVersion ?? null,
        },
        update: {
          payloadFixture: c.payloadFixture as unknown as object,
          judgeCriteria: c.judgeCriteria as unknown as object,
          minJudgeScore: c.minJudgeScore,
          forbiddenKeys: c.forbiddenKeys,
          notes: c.notes ?? null,
          expectedStatus: c.expectedStatus ?? null,
          templateVersion: c.templateVersion ?? null,
        },
      });
      console.info(`  Upserted golden case: ${c.variant}/${c.label}`);
    }
  });
}
