import type { AnalyticsMemberStatsRow } from "@/application/domain/analytics/community/data/type";

/**
 * Member factory keeps the tests readable — every test below really
 * only cares about 2–3 fields, so the helper defaults the rest to
 * non-interesting values.
 */
export function member(overrides: Partial<AnalyticsMemberStatsRow>): AnalyticsMemberStatsRow {
  const monthsIn = overrides.monthsIn ?? 1;
  // lastDonationDay defaults to undefined → null so a member that
  // hasn't been given a donation history is "latent". Override
  // explicitly when testing isDormant / computeDormantCount.
  const lastDonationDay =
    overrides.lastDonationDay === undefined ? null : overrides.lastDonationDay;
  const firstDonationDay =
    overrides.firstDonationDay === undefined ? null : overrides.firstDonationDay;
  // joinedAt defaults to a fixed date so cohort-funnel tests that
  // don't care about the exact value get a stable bucket. Override
  // when testing cohort-bucketing.
  const joinedAt = overrides.joinedAt ?? new Date("2026-01-01T00:00:00Z");
  return {
    userId: overrides.userId ?? "u",
    name: overrides.name ?? null,
    monthsIn,
    donationOutMonths: overrides.donationOutMonths ?? 0,
    totalPointsOut: overrides.totalPointsOut ?? BigInt(0),
    userSendRate: overrides.userSendRate ?? 0,
    uniqueDonationRecipients: overrides.uniqueDonationRecipients ?? 0,
    // daysIn defaults to monthsIn × 30 so test cases that only
    // care about the calendar-month tenure stay consistent with
    // the daysIn-based check inside classifyMember. Override
    // explicitly when testing the cross-month-boundary artifact
    // (monthsIn high, daysIn low).
    daysIn: overrides.daysIn ?? monthsIn * 30,
    donationOutDays: overrides.donationOutDays ?? 0,
    // Receiver-side counters default to 0 (= never received a
    // DONATION) for the same "fixture stays minimal" reason as
    // the sender-side defaults above. Override per-test only
    // when exercising recipient-axis logic.
    totalPointsIn: overrides.totalPointsIn ?? BigInt(0),
    donationInMonths: overrides.donationInMonths ?? 0,
    donationInDays: overrides.donationInDays ?? 0,
    uniqueDonationSenders: overrides.uniqueDonationSenders ?? 0,
    lastDonationDay,
    firstDonationDay,
    joinedAt,
  };
}
