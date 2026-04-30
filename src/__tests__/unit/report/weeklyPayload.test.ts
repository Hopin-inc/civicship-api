import "reflect-metadata";
import { Role, TransactionReason } from "@prisma/client";
import ReportPresenter from "@/application/domain/report/presenter";
import { CommunityContextRow, DeepestChainRow } from "@/application/domain/report/transactionStats/data/rows";

/**
 * Pure-function tests for the Phase-1 additions on ReportPresenter:
 * community_context, deepest_chain, and the custom_context pass-through.
 * Pre-existing payload fields have integration coverage elsewhere; this
 * suite focuses on the new code paths only.
 */
describe("ReportPresenter.weeklyPayload (community_context / deepest_chain)", () => {
  const baseInput = {
    communityId: "community-1",
    range: {
      from: new Date(Date.UTC(2026, 3, 10)),
      to: new Date(Date.UTC(2026, 3, 16)),
    },
    referenceDate: new Date(Date.UTC(2026, 3, 16)),
    summaries: [],
    activeUsers: [],
    topUserAggregates: [],
    profiles: [],
    comments: [],
  };

  const sampleContext: CommunityContextRow = {
    communityId: "community-1",
    name: "Example Community",
    pointName: "ExamplePoint",
    bio: "Community bio",
    establishedAt: new Date(Date.UTC(2025, 0, 1)),
    website: "https://example.com",
    totalMembers: 20,
    activeUsersInWindow: 5,
  };

  const sampleDeepest: DeepestChainRow = {
    transactionId: "tx-1",
    chainDepth: 4,
    reason: TransactionReason.GRANT,
    comment: "thanks!",
    date: new Date(Date.UTC(2026, 3, 14)),
    fromUserId: "user-a",
    toUserId: "user-b",
    createdByUserId: "user-a",
    parentTxId: "tx-0",
  };

  it("maps community_context and computes active_rate when members > 0", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: sampleContext,
      deepestChain: null,
    });

    expect(payload.community_context).toEqual({
      community_id: "community-1",
      name: "Example Community",
      point_name: "ExamplePoint",
      bio: "Community bio",
      established_at: "2025-01-01",
      website: "https://example.com",
      total_members: 20,
      active_users_in_window: 5,
      active_rate: 0.25,
      custom_context: null,
    });
  });

  it("emits active_rate null when the community has no JOINED members (no divide-by-zero)", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: { ...sampleContext, totalMembers: 0, activeUsersInWindow: 0 },
      deepestChain: null,
    });

    expect(payload.community_context?.active_rate).toBeNull();
  });

  it("passes customContext through to community_context.custom_context", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: sampleContext,
      deepestChain: null,
      customContext: "## Mission\nLocal mutual aid.",
    });

    expect(payload.community_context?.custom_context).toBe("## Mission\nLocal mutual aid.");
  });

  it("emits community_context = null when the repository returned null", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: null,
      deepestChain: null,
    });

    expect(payload.community_context).toBeNull();
  });

  it("maps deepest_chain and converts the date to a JST ISO day", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: null,
      deepestChain: sampleDeepest,
    });

    expect(payload.deepest_chain).toEqual({
      transaction_id: "tx-1",
      chain_depth: 4,
      reason: TransactionReason.GRANT,
      comment: "thanks!",
      date: "2026-04-14",
      from_user_id: "user-a",
      to_user_id: "user-b",
      created_by_user_id: "user-a",
      parent_tx_id: "tx-0",
    });
  });

  it("emits deepest_chain = null when no chained transaction exists in the window", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: null,
      deepestChain: null,
    });

    expect(payload.deepest_chain).toBeNull();
  });

  it("leaves previous_period null when the usecase didn't opt in", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: sampleContext,
      deepestChain: null,
    });

    expect(payload.previous_period).toBeNull();
  });

  it("maps previous_period and pre-computes growth_rate vs current window", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      summaries: [
        {
          date: new Date(Date.UTC(2026, 3, 14)),
          communityId: "community-1",
          reason: TransactionReason.DONATION,
          txCount: 20,
          pointsSum: 10000n,
          chainRootCount: 2,
          chainDescendantCount: 5,
          maxChainDepth: 3,
          sumChainDepth: 10,
          issuanceCount: 0,
          burnCount: 0,
        },
      ],
      communityContext: { ...sampleContext, activeUsersInWindow: 10 },
      deepestChain: null,
      previousPeriod: {
        range: {
          from: new Date(Date.UTC(2026, 3, 3)),
          to: new Date(Date.UTC(2026, 3, 9)),
        },
        aggregate: {
          activeUsersInWindow: 5,
          totalTxCount: 10,
          totalPointsSum: 5000n,
          newMembers: 1,
        },
      },
    });

    expect(payload.previous_period).toEqual({
      period: { from: "2026-04-03", to: "2026-04-09" },
      active_users_in_window: 5,
      total_tx_count: 10,
      total_points_sum: 5000,
      new_members: 1,
      growth_rate: {
        active_users: 100,
        tx_count: 100,
        points_sum: 100,
      },
    });
  });

  it("returns growth_rate=null fields when the previous window had zero activity", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: sampleContext,
      deepestChain: null,
      previousPeriod: {
        range: {
          from: new Date(Date.UTC(2026, 3, 3)),
          to: new Date(Date.UTC(2026, 3, 9)),
        },
        aggregate: {
          activeUsersInWindow: 0,
          totalTxCount: 0,
          totalPointsSum: 0n,
          newMembers: 0,
        },
      },
    });

    expect(payload.previous_period?.growth_rate).toEqual({
      active_users: null,
      tx_count: null,
      points_sum: null,
    });
  });

  // Regression guard for the "null growth_rate.active_users when community
  // context is missing" fix. Without a current-window active-user
  // numerator on the same DONATION-scoped frame as previous_period, we
  // refuse to emit a percentage — the presenter must not fall back to a
  // different-frame proxy that would produce a scale-mismatched comparison.
  // tx_count / points_sum are sourced from the daily summaries already in
  // the payload, so those growth rates still compute even without the
  // community context.
  it("nulls out growth_rate.active_users when communityContext is null (preserves tx_count / points_sum)", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      summaries: [
        {
          date: new Date(Date.UTC(2026, 3, 14)),
          communityId: "community-1",
          reason: TransactionReason.DONATION,
          txCount: 20,
          pointsSum: 10000n,
          chainRootCount: 0,
          chainDescendantCount: 0,
          maxChainDepth: null,
          sumChainDepth: 0,
          issuanceCount: 0,
          burnCount: 0,
        },
      ],
      communityContext: null,
      deepestChain: null,
      previousPeriod: {
        range: {
          from: new Date(Date.UTC(2026, 3, 3)),
          to: new Date(Date.UTC(2026, 3, 9)),
        },
        aggregate: {
          activeUsersInWindow: 5,
          totalTxCount: 10,
          totalPointsSum: 5000n,
          newMembers: 1,
        },
      },
    });

    expect(payload.previous_period?.growth_rate).toEqual({
      active_users: null,
      tx_count: 100,
      points_sum: 100,
    });
  });

  it("leaves pre-existing payload fields intact alongside the new blocks", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      topUserAggregates: [
        {
          userId: "user-a",
          txCountIn: 1,
          txCountOut: 2,
          pointsIn: 10n,
          pointsOut: 20n,
          donationOutCount: 0,
          donationOutPoints: 0n,
          receivedDonationCount: 0,
          chainRootCount: 1,
          maxChainDepthStarted: 2,
          chainDepthReachedMax: null,
          uniqueCounterpartiesSum: 1,
        },
      ],
      profiles: [
        {
          userId: "user-a",
          communityId: "community-1",
          name: "Alice",
          userBio: null,
          membershipBio: null,
          headline: null,
          role: Role.MEMBER,
          joinedAt: new Date(Date.UTC(2026, 3, 1)),
        },
      ],
      communityContext: sampleContext,
      deepestChain: sampleDeepest,
    });

    expect(payload.period).toEqual({ from: "2026-04-10", to: "2026-04-16" });
    expect(payload.top_users).toHaveLength(1);
    expect(payload.top_users[0].user_id).toBe("user-a");
  });

  it("leaves retention null when the usecase didn't opt in", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: sampleContext,
      deepestChain: null,
    });

    expect(payload.retention).toBeNull();
  });

  it("maps retention aggregate + cohort rows into active_rate / week-N rates", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      communityContext: sampleContext,
      deepestChain: null,
      retention: {
        aggregate: {
          newMembers: 3,
          retainedSenders: 5,
          returnedSenders: 2,
          churnedSenders: 1,
          currentSendersCount: 8,
          currentActiveCount: 10,
        },
        totalMembers: 20,
        week1: { cohortSize: 4, activeNextWeek: 2 },
        week4: { cohortSize: 0, activeNextWeek: 0 },
      },
    });

    expect(payload.retention).toEqual({
      new_members: 3,
      retained_senders: 5,
      returned_senders: 2,
      churned_senders: 1,
      active_rate_sender: 8 / 20,
      active_rate_any: 10 / 20,
      week1_retention: 0.5,
      // week4 cohort size is 0 → null rather than 0%.
      week4_retention: null,
    });
  });

  it("surfaces true_unique_counterparties from the map, falling back to null for misses", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      topUserAggregates: [
        {
          userId: "user-a",
          txCountIn: 1,
          txCountOut: 2,
          pointsIn: 10n,
          pointsOut: 20n,
          donationOutCount: 0,
          donationOutPoints: 0n,
          receivedDonationCount: 0,
          chainRootCount: 1,
          maxChainDepthStarted: 2,
          chainDepthReachedMax: null,
          uniqueCounterpartiesSum: 7,
        },
        {
          userId: "user-b",
          txCountIn: 0,
          txCountOut: 0,
          pointsIn: 0n,
          pointsOut: 0n,
          donationOutCount: 0,
          donationOutPoints: 0n,
          receivedDonationCount: 1,
          chainRootCount: 0,
          maxChainDepthStarted: null,
          chainDepthReachedMax: null,
          uniqueCounterpartiesSum: 0,
        },
      ],
      profiles: [],
      communityContext: null,
      deepestChain: null,
      trueUniqueCounterparties: new Map([["user-a", 3]]),
    });

    expect(payload.top_users[0].true_unique_counterparties).toBe(3);
    // user-b missed the map → null (distinguishes receiver-only from zero).
    expect(payload.top_users[1].true_unique_counterparties).toBeNull();
  });

  // Regression guard for the BigInt-then-narrow fix: each row's pointsSum
  // fits in Number.MAX_SAFE_INTEGER but the total does not. The presenter
  // must sum as BigInt and narrow once at the boundary so the safe-integer
  // guard fires on the TOTAL; narrowing per row and summing as Number would
  // silently lose precision on the sum.
  it("throws RangeError when the sum of individually-safe pointsSum values exceeds MAX_SAFE_INTEGER", () => {
    const nearMax = BigInt(Number.MAX_SAFE_INTEGER);
    expect(() =>
      ReportPresenter.weeklyPayload({
        ...baseInput,
        summaries: [
          {
            date: new Date(Date.UTC(2026, 3, 14)),
            communityId: "community-1",
            reason: TransactionReason.DONATION,
            txCount: 1,
            pointsSum: nearMax,
            chainRootCount: 0,
            chainDescendantCount: 0,
            maxChainDepth: null,
            sumChainDepth: 0,
            issuanceCount: 0,
            burnCount: 0,
          },
          {
            date: new Date(Date.UTC(2026, 3, 15)),
            communityId: "community-1",
            reason: TransactionReason.POINT_REWARD,
            txCount: 1,
            pointsSum: nearMax,
            chainRootCount: 0,
            chainDescendantCount: 0,
            maxChainDepth: null,
            sumChainDepth: 0,
            issuanceCount: 0,
            burnCount: 0,
          },
        ],
        communityContext: sampleContext,
        deepestChain: null,
        previousPeriod: {
          range: {
            from: new Date(Date.UTC(2026, 3, 3)),
            to: new Date(Date.UTC(2026, 3, 9)),
          },
          aggregate: {
            activeUsersInWindow: 1,
            totalTxCount: 1,
            totalPointsSum: 1n,
            newMembers: 0,
          },
        },
      }),
    ).toThrow(RangeError);
  });

  it("narrows the pointsSum total once at the boundary when individual rows and the total are all in safe range", () => {
    const payload = ReportPresenter.weeklyPayload({
      ...baseInput,
      summaries: [
        {
          date: new Date(Date.UTC(2026, 3, 14)),
          communityId: "community-1",
          reason: TransactionReason.DONATION,
          txCount: 3,
          pointsSum: 1_000_000n,
          chainRootCount: 0,
          chainDescendantCount: 0,
          maxChainDepth: null,
          sumChainDepth: 0,
          issuanceCount: 0,
          burnCount: 0,
        },
        {
          date: new Date(Date.UTC(2026, 3, 15)),
          communityId: "community-1",
          reason: TransactionReason.POINT_REWARD,
          txCount: 2,
          pointsSum: 500_000n,
          chainRootCount: 0,
          chainDescendantCount: 0,
          maxChainDepth: null,
          sumChainDepth: 0,
          issuanceCount: 0,
          burnCount: 0,
        },
      ],
      communityContext: { ...sampleContext, activeUsersInWindow: 10 },
      deepestChain: null,
      previousPeriod: {
        range: {
          from: new Date(Date.UTC(2026, 3, 3)),
          to: new Date(Date.UTC(2026, 3, 9)),
        },
        aggregate: {
          activeUsersInWindow: 10,
          totalTxCount: 5,
          totalPointsSum: 1_500_000n,
          newMembers: 0,
        },
      },
    });

    // 1_000_000 + 500_000 = 1_500_000, matching previous period → 0% growth.
    expect(payload.previous_period?.total_points_sum).toBe(1_500_000);
    expect(payload.previous_period?.growth_rate.points_sum).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Pre-computed aggregate fields (PR-A v5): aggregate / aggregates_by_reason /
  // peak_active_day / active_rate_pct. The presenter pre-computes these so the
  // prompt template can substitute them as fixed values rather than asking the
  // LLM to GROUP BY / SUM / MAX / format percentages — every arithmetic step
  // moved out of the model is one less hallucination surface.
  // ---------------------------------------------------------------------------

  describe("aggregates_by_reason", () => {
    it("groups daily_summaries by reason and sums tx_count / points_sum", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        summaries: [
          {
            date: new Date(Date.UTC(2026, 3, 14)),
            communityId: "community-1",
            reason: TransactionReason.DONATION,
            txCount: 3,
            pointsSum: 1500n,
            chainRootCount: 0,
            chainDescendantCount: 0,
            maxChainDepth: null,
            sumChainDepth: 0,
            issuanceCount: 0,
            burnCount: 0,
          },
          {
            date: new Date(Date.UTC(2026, 3, 15)),
            communityId: "community-1",
            reason: TransactionReason.DONATION,
            txCount: 2,
            pointsSum: 800n,
            chainRootCount: 0,
            chainDescendantCount: 0,
            maxChainDepth: null,
            sumChainDepth: 0,
            issuanceCount: 0,
            burnCount: 0,
          },
          {
            date: new Date(Date.UTC(2026, 3, 14)),
            communityId: "community-1",
            reason: TransactionReason.GRANT,
            txCount: 1,
            pointsSum: 5000n,
            chainRootCount: 0,
            chainDescendantCount: 0,
            maxChainDepth: null,
            sumChainDepth: 0,
            issuanceCount: 0,
            burnCount: 0,
          },
        ],
        communityContext: null,
        deepestChain: null,
      });

      // ONBOARDING is pre-filled with zero even though no ONBOARDING rows
      // were summed — without that the prompt's `[...]` copy-verbatim rule
      // breaks for quiet weeks. DONATION / GRANT carry their summed values.
      expect(payload.aggregates_by_reason).toEqual({
        [TransactionReason.DONATION]: { tx_count: 5, points_sum: 2300 },
        [TransactionReason.GRANT]: { tx_count: 1, points_sum: 5000 },
        [TransactionReason.ONBOARDING]: { tx_count: 0, points_sum: 0 },
      });
    });

    it("pre-fills the core reasons with zero when daily_summaries is empty", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        communityContext: null,
        deepestChain: null,
      });

      // The keys must be present so prompt placeholders like
      // `[aggregates_by_reason.DONATION.tx_count]` still resolve to a real
      // number — the [...] copy-verbatim rule cannot apply to a missing key.
      expect(payload.aggregates_by_reason).toEqual({
        [TransactionReason.DONATION]: { tx_count: 0, points_sum: 0 },
        [TransactionReason.GRANT]: { tx_count: 0, points_sum: 0 },
        [TransactionReason.ONBOARDING]: { tx_count: 0, points_sum: 0 },
      });
    });

    // Regression guard: the per-reason sum must be computed at BigInt and
    // narrowed once per reason key, not row-by-row. If individual rows fit
    // in MAX_SAFE_INTEGER but their bucketed sum does not, narrowing per row
    // would silently lose precision. Mirrors the same guarantee the
    // top-level `aggregate` field already provides via aggregateTransactionTotals.
    it("throws RangeError when a per-reason sum overflows MAX_SAFE_INTEGER", () => {
      const nearMax = BigInt(Number.MAX_SAFE_INTEGER);
      expect(() =>
        ReportPresenter.weeklyPayload({
          ...baseInput,
          summaries: [
            {
              date: new Date(Date.UTC(2026, 3, 14)),
              communityId: "community-1",
              reason: TransactionReason.DONATION,
              txCount: 1,
              pointsSum: nearMax,
              chainRootCount: 0,
              chainDescendantCount: 0,
              maxChainDepth: null,
              sumChainDepth: 0,
              issuanceCount: 0,
              burnCount: 0,
            },
            {
              date: new Date(Date.UTC(2026, 3, 15)),
              communityId: "community-1",
              reason: TransactionReason.DONATION,
              txCount: 1,
              pointsSum: nearMax,
              chainRootCount: 0,
              chainDescendantCount: 0,
              maxChainDepth: null,
              sumChainDepth: 0,
              issuanceCount: 0,
              burnCount: 0,
            },
          ],
          communityContext: null,
          deepestChain: null,
        }),
      ).toThrow(RangeError);
    });
  });

  describe("peak_active_day", () => {
    it("returns the day with the largest active_users count", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        activeUsers: [
          { date: new Date(Date.UTC(2026, 3, 14)), communityId: "community-1", activeUsers: 4, senders: 3, receivers: 2 },
          { date: new Date(Date.UTC(2026, 3, 15)), communityId: "community-1", activeUsers: 9, senders: 6, receivers: 5 },
          { date: new Date(Date.UTC(2026, 3, 16)), communityId: "community-1", activeUsers: 7, senders: 5, receivers: 4 },
        ],
        communityContext: null,
        deepestChain: null,
      });

      expect(payload.peak_active_day).toEqual({ date: "2026-04-15", active_users: 9 });
    });

    it("breaks ties by surfacing the earliest date", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        activeUsers: [
          { date: new Date(Date.UTC(2026, 3, 14)), communityId: "community-1", activeUsers: 5, senders: 3, receivers: 2 },
          { date: new Date(Date.UTC(2026, 3, 15)), communityId: "community-1", activeUsers: 5, senders: 3, receivers: 2 },
          { date: new Date(Date.UTC(2026, 3, 16)), communityId: "community-1", activeUsers: 5, senders: 3, receivers: 2 },
        ],
        communityContext: null,
        deepestChain: null,
      });

      expect(payload.peak_active_day).toEqual({ date: "2026-04-14", active_users: 5 });
    });

    it("returns null when daily_active_users is empty", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        communityContext: null,
        deepestChain: null,
      });

      expect(payload.peak_active_day).toBeNull();
    });
  });

  describe("active_rate_pct", () => {
    it("formats the 0..1 ratio as a one-decimal percentage string", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        // 5 / 20 = 0.25 → "25.0"
        communityContext: { ...sampleContext, totalMembers: 20, activeUsersInWindow: 5 },
        deepestChain: null,
      });

      expect(payload.active_rate_pct).toBe("25.0");
    });

    it("returns null when active_rate is null (no JOINED members)", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        communityContext: { ...sampleContext, totalMembers: 0, activeUsersInWindow: 0 },
        deepestChain: null,
      });

      expect(payload.active_rate_pct).toBeNull();
    });

    it("returns null when communityContext itself is null", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        communityContext: null,
        deepestChain: null,
      });

      expect(payload.active_rate_pct).toBeNull();
    });
  });

  describe("aggregate (top-level totals)", () => {
    it("matches the totals from aggregateTransactionTotals", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        summaries: [
          {
            date: new Date(Date.UTC(2026, 3, 14)),
            communityId: "community-1",
            reason: TransactionReason.DONATION,
            txCount: 3,
            pointsSum: 1500n,
            chainRootCount: 0,
            chainDescendantCount: 0,
            maxChainDepth: null,
            sumChainDepth: 0,
            issuanceCount: 0,
            burnCount: 0,
          },
          {
            date: new Date(Date.UTC(2026, 3, 15)),
            communityId: "community-1",
            reason: TransactionReason.GRANT,
            txCount: 2,
            pointsSum: 5000n,
            chainRootCount: 0,
            chainDescendantCount: 0,
            maxChainDepth: null,
            sumChainDepth: 0,
            issuanceCount: 0,
            burnCount: 0,
          },
        ],
        communityContext: null,
        deepestChain: null,
      });

      expect(payload.aggregate).toEqual({ tx_count: 5, points_sum: 6500 });
    });

    it("emits zero counts when daily_summaries is empty", () => {
      const payload = ReportPresenter.weeklyPayload({
        ...baseInput,
        communityContext: null,
        deepestChain: null,
      });

      expect(payload.aggregate).toEqual({ tx_count: 0, points_sum: 0 });
    });
  });
});
