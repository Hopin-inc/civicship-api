import "reflect-metadata";
import { Role, TransactionReason } from "@prisma/client";
import ReportPresenter from "@/application/domain/report/presenter";
import { CommunityContextRow, DeepestChainRow } from "@/application/domain/report/data/interface";

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
});
