import { analyzeCoverage } from "@/application/domain/report/util/coverage";
import type { WeeklyReportPayload } from "@/application/domain/report/types";

const basePayload: WeeklyReportPayload = {
  period: { from: "2026-04-11", to: "2026-04-17" },
  community_id: "test",
  community_context: {
    community_id: "test",
    name: "Test",
    point_name: "pt",
    bio: null,
    established_at: null,
    website: null,
    total_members: 566,
    active_users_in_window: 26,
    active_rate: 26 / 566,
    custom_context: null,
  },
  deepest_chain: {
    transaction_id: "tx-1",
    chain_depth: 19,
    reason: "DONATION",
    comment: null,
    date: "2026-04-15",
    from_user_id: null,
    to_user_id: null,
    created_by_user_id: null,
    parent_tx_id: null,
  },
  daily_summaries: [],
  daily_active_users: [],
  top_users: [],
  highlight_comments: [],
  previous_period: null,
  retention: null,
  aggregate: { tx_count: 0, points_sum: 0 },
  aggregates_by_reason: {},
  peak_active_day: null,
  active_rate_pct: null,
};

describe("analyzeCoverage", () => {
  it("flags numeric fields that appear as substrings in the output", () => {
    const output = "今週は26人が活動しました。最深チェーンは19段で、総メンバー566名のうち...";
    const coverage = analyzeCoverage(basePayload, output);
    expect(coverage.active_users.value).toBe(26);
    expect(coverage.active_users.mentioned).toBe(true);
    expect(coverage.total_members.value).toBe(566);
    expect(coverage.total_members.mentioned).toBe(true);
    expect(coverage.deepest_chain_depth.value).toBe(19);
    expect(coverage.deepest_chain_depth.mentioned).toBe(true);
  });

  it("reports mentioned=false when the value is not in the output", () => {
    const output = "活動の記録です。"; // none of 26 / 566 / 19 appear
    const coverage = analyzeCoverage(basePayload, output);
    expect(coverage.active_users.mentioned).toBe(false);
    expect(coverage.total_members.mentioned).toBe(false);
    expect(coverage.deepest_chain_depth.mentioned).toBe(false);
  });

  it("returns mentioned=false when the source value is null", () => {
    // null community_context => active_users / total_members both
    // become null, and the substring check should not trigger on the
    // empty / undefined stringification of null.
    const coverage = analyzeCoverage(
      { ...basePayload, community_context: null, deepest_chain: null },
      "any output",
    );
    expect(coverage.active_users.value).toBeNull();
    expect(coverage.active_users.mentioned).toBe(false);
    expect(coverage.total_members.value).toBeNull();
    expect(coverage.total_members.mentioned).toBe(false);
    expect(coverage.deepest_chain_depth.value).toBeNull();
    expect(coverage.deepest_chain_depth.mentioned).toBe(false);
  });
});
