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

  // ---------------------------------------------------------------------------
  // top_user_names / top_user_points (PR-B): per-user fabrication signal.
  // names is the primary signal — the auto-reject judge prompt and the
  // usecase warning log both look at it. points is records-only because
  // numeric substring matches false-positive too easily.
  // ---------------------------------------------------------------------------

  const sampleTopUsers = [
    {
      user_id: "u-a",
      name: "貴凛庁株式会社",
      user_bio: null,
      membership_bio: null,
      headline: null,
      role: "MEMBER",
      joined_at: "2024-01-01",
      days_since_joined: 100,
      tx_count_in: 1,
      tx_count_out: 1,
      points_in: 21000,
      points_out: 26000,
      donation_out_count: 1,
      donation_out_points: 26000,
      received_donation_count: 1,
      chain_root_count: 0,
      max_chain_depth_started: null,
      chain_depth_reached_max: null,
      unique_counterparties_sum: 1,
      true_unique_counterparties: 1,
    },
    {
      user_id: "u-b",
      name: "おおともやすひろ",
      user_bio: null,
      membership_bio: null,
      headline: null,
      role: "MEMBER",
      joined_at: "2024-02-01",
      days_since_joined: 70,
      tx_count_in: 0,
      tx_count_out: 0,
      points_in: 0,
      points_out: 0,
      donation_out_count: 0,
      donation_out_points: 0,
      received_donation_count: 0,
      chain_root_count: 0,
      max_chain_depth_started: null,
      chain_depth_reached_max: null,
      unique_counterparties_sum: 0,
      true_unique_counterparties: null,
    },
  ];

  it("flags top_user_names that appear in the output", () => {
    const payload = { ...basePayload, top_users: sampleTopUsers };
    const output = "貴凛庁株式会社さんが活躍しました。おおともやすひろさんも参加。";
    const coverage = analyzeCoverage(payload, output);
    expect(coverage.top_user_names).toEqual([
      { name: "貴凛庁株式会社", mentioned: true },
      { name: "おおともやすひろ", mentioned: true },
    ]);
  });

  it("flags top_user_names as mentioned=false when the name is missing", () => {
    const payload = { ...basePayload, top_users: sampleTopUsers };
    const output = "今週は静かでした。"; // neither name appears
    const coverage = analyzeCoverage(payload, output);
    expect(coverage.top_user_names[0].mentioned).toBe(false);
    expect(coverage.top_user_names[1].mentioned).toBe(false);
  });

  it("returns empty top_user_names / top_user_points when top_users is empty", () => {
    const coverage = analyzeCoverage(basePayload, "any output");
    expect(coverage.top_user_names).toEqual([]);
    expect(coverage.top_user_points).toEqual([]);
  });

  it("treats empty name as vacuously mentioned (presenter profile-lookup miss)", () => {
    const payload = {
      ...basePayload,
      top_users: [{ ...sampleTopUsers[0], name: "" }],
    };
    const coverage = analyzeCoverage(payload, "irrelevant");
    expect(coverage.top_user_names[0].mentioned).toBe(true);
  });

  it("flags top_user_points fields that match in the output", () => {
    const payload = { ...basePayload, top_users: [sampleTopUsers[0]] };
    const output = "貴凛庁株式会社は 21000 受け取り、26000 を贈りました。";
    const coverage = analyzeCoverage(payload, output);
    expect(coverage.top_user_points[0]).toEqual({
      name: "貴凛庁株式会社",
      points_in: true,
      points_out: true,
      // donation_out_points is also 26000 — same string, also matches.
      donation_out_points: true,
    });
  });

  it("treats zero points fields as vacuously mentioned", () => {
    // sampleTopUsers[1] has all zero points / donations — the presenter
    // emits zero for receiver-only or inactive users, and requiring a
    // substring match for "0" would falsely trigger on any number
    // containing "0" anywhere.
    const payload = { ...basePayload, top_users: [sampleTopUsers[1]] };
    const coverage = analyzeCoverage(payload, "no numbers at all");
    expect(coverage.top_user_points[0]).toEqual({
      name: "おおともやすひろ",
      points_in: true,
      points_out: true,
      donation_out_points: true,
    });
  });

  it("flags top_user_points fields as false when the non-zero value is missing", () => {
    const payload = { ...basePayload, top_users: [sampleTopUsers[0]] };
    const coverage = analyzeCoverage(payload, "no numbers");
    expect(coverage.top_user_points[0]).toEqual({
      name: "貴凛庁株式会社",
      points_in: false,
      points_out: false,
      donation_out_points: false,
    });
  });
});
