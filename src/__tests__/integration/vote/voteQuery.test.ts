import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import VoteUseCase from "@/application/domain/vote/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createVoteTopic } from "./helpers";

// ─── 共通セットアップ ─────────────────────────────────────────────────────────

describe("Vote Integration: VoteQuery", () => {
  let voteUseCase: VoteUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();

    issuer = container.resolve(PrismaClientIssuer);
    voteUseCase = container.resolve(VoteUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  // ─── anyoneBrowseVoteTopics ───────────────────────────────────────────────

  describe("anyoneBrowseVoteTopics", () => {
    it("should return empty connection when community has no vote topics", async () => {
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const ctx = { issuer } as unknown as IContext;

      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, { communityId: community.id });

      expect(result.totalCount).toBe(0);
      expect(result.nodes).toHaveLength(0);
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it("should return phase=UPCOMING for a topic whose startsAt is in the future", async () => {
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() + 3_600_000),
        endsAt: new Date(now.getTime() + 7_200_000),
      });

      const ctx = { issuer } as unknown as IContext;
      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, { communityId: community.id });

      expect(result.nodes[0].phase).toBe("UPCOMING");
    });

    it("should return phase=OPEN for an active topic", async () => {
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { issuer } as unknown as IContext;
      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, { communityId: community.id });

      expect(result.nodes[0].phase).toBe("OPEN");
    });

    it("should return phase=CLOSED for an ended topic", async () => {
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() - 7_200_000),
        endsAt: new Date(now.getTime() - 60_000),
      });

      const ctx = { issuer } as unknown as IContext;
      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, { communityId: community.id });

      expect(result.nodes[0].phase).toBe("CLOSED");
    });

    it("should exclude topics belonging to other communities", async () => {
      const communityA = await TestDataSourceHelper.createCommunity({ name: "community-a", pointName: "pt" });
      const communityB = await TestDataSourceHelper.createCommunity({ name: "community-b", pointName: "pt" });
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      const period = {
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      };
      await createVoteTopic({ communityId: communityA.id, createdBy: user.id, ...period });
      await createVoteTopic({ communityId: communityB.id, createdBy: user.id, ...period });

      const ctx = { issuer } as unknown as IContext;
      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, { communityId: communityA.id });

      expect(result.totalCount).toBe(1);
      expect(result.nodes).toHaveLength(1);
    });

    it("should return hasNextPage=true when more records exist beyond the page", async () => {
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      const period = {
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      };
      // Create 3 topics; request first=2 → hasNextPage should be true
      await createVoteTopic({ communityId: community.id, createdBy: user.id, ...period });
      await createVoteTopic({ communityId: community.id, createdBy: user.id, ...period });
      await createVoteTopic({ communityId: community.id, createdBy: user.id, ...period });

      const ctx = { issuer } as unknown as IContext;
      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, { communityId: community.id, first: 2 });

      expect(result.totalCount).toBe(3);
      expect(result.nodes).toHaveLength(2);
      expect(result.pageInfo.hasNextPage).toBe(true);
    });

    it("should paginate correctly using cursor and return hasNextPage=false on last page", async () => {
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      const period = {
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      };
      await createVoteTopic({ communityId: community.id, createdBy: user.id, ...period });
      await createVoteTopic({ communityId: community.id, createdBy: user.id, ...period });
      await createVoteTopic({ communityId: community.id, createdBy: user.id, ...period });

      const ctx = { issuer } as unknown as IContext;

      // Page 1: 2 records, hasNextPage=true
      const page1 = await voteUseCase.anyoneBrowseVoteTopics(ctx, {
        communityId: community.id,
        first: 2,
      });
      expect(page1.nodes).toHaveLength(2);
      expect(page1.pageInfo.hasNextPage).toBe(true);

      // Page 2: use endCursor from page 1
      const cursor = page1.pageInfo.endCursor ?? undefined;
      const page2 = await voteUseCase.anyoneBrowseVoteTopics(ctx, {
        communityId: community.id,
        first: 2,
        cursor,
      });
      expect(page2.nodes).toHaveLength(1);
      expect(page2.pageInfo.hasNextPage).toBe(false);
      // cursor を指定してページ2を取得したので hasPreviousPage=true
      expect(page2.pageInfo.hasPreviousPage).toBe(true);
      // ページ1は cursor なしなので hasPreviousPage=false
      expect(page1.pageInfo.hasPreviousPage).toBe(false);
    });

    it("should hide voteCount/totalPower for an active topic when user is not a manager", async () => {
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      const { optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      // Seed non-zero counts directly to verify they are masked
      await prismaClient.voteOption.update({
        where: { id: optionA.id },
        data: { voteCount: 5, totalPower: 10 },
      });

      // Anonymous context (no currentUser) → isManagerOfCommunity = false
      const ctx = { issuer } as unknown as IContext;
      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, { communityId: community.id });

      const opt = result.nodes[0].options.find((o) => o.id === optionA.id);
      expect(opt?.voteCount).toBeNull();
      expect(opt?.totalPower).toBeNull();
    });

    it("should show voteCount/totalPower for an active topic when user is a manager", async () => {
      const manager = await TestDataSourceHelper.createUser({
        name: "Manager",
        slug: "manager-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: manager.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MANAGER,
      });

      const now = new Date();
      const { optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: manager.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      await prismaClient.voteOption.update({
        where: { id: optionA.id },
        data: { voteCount: 5, totalPower: 10 },
      });

      // Manager context: memberships must include the community with MANAGER role
      // getMembershipRolesByCtx reads ctx.currentUser.memberships to determine isManager
      const ctx = {
        currentUser: {
          id: manager.id,
          memberships: [{ communityId: community.id, role: Role.MANAGER }],
        },
        issuer,
      } as unknown as IContext;

      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, { communityId: community.id });

      const opt = result.nodes[0].options.find((o) => o.id === optionA.id);
      expect(opt?.voteCount).toBe(5);
      expect(opt?.totalPower).toBe(10);
    });
  });

  // ─── anyoneViewVoteTopic ──────────────────────────────────────────────────

  describe("anyoneViewVoteTopic", () => {
    it("should return the vote topic when it exists", async () => {
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      const { topic } = await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { issuer } as unknown as IContext;
      const result = await voteUseCase.anyoneViewVoteTopic(ctx, { id: topic.id });

      expect(result).not.toBeNull();
      expect(result?.id).toBe(topic.id);
      expect(result?.gate.type).toBe("MEMBERSHIP");
      expect(result?.powerPolicy.type).toBe("FLAT");
      expect(result?.options).toHaveLength(2);
    });

    it("should return null when the vote topic does not exist", async () => {
      const ctx = { issuer } as unknown as IContext;
      const result = await voteUseCase.anyoneViewVoteTopic(ctx, { id: "nonexistent-id" });

      expect(result).toBeNull();
    });
  });

  // ─── userGetMyVoteEligibility ─────────────────────────────────────────────

  describe("userGetMyVoteEligibility", () => {
    it("should return eligible=true, currentPower=1 and myBallot=null when JOINED member has not voted (FLAT policy)", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "User",
        slug: "user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic } = await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { currentUser: { id: user.id }, issuer } as unknown as IContext;
      const result = await voteUseCase.userGetMyVoteEligibility(ctx, { topicId: topic.id });

      expect(result.eligible).toBe(true);
      expect(result.currentPower).toBe(1);
      expect(result.myBallot).toBeNull();
    });

    it("should return eligible=true with myBallot populated when user has already voted", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Voter",
        slug: "voter-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { currentUser: { id: user.id }, issuer } as unknown as IContext;
      // Cast a vote first
      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } });

      const result = await voteUseCase.userGetMyVoteEligibility(ctx, { topicId: topic.id });

      expect(result.eligible).toBe(true);
      expect(result.myBallot).not.toBeNull();
      expect(result.myBallot?.power).toBe(1);
    });

    it("should return eligible=false with reason=NOT_A_MEMBER when user has no membership", async () => {
      const nonMember = await TestDataSourceHelper.createUser({
        name: "NonMember",
        slug: "non-member-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      const creator = await TestDataSourceHelper.createUser({
        name: "Creator",
        slug: "creator-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const now = new Date();
      const { topic } = await createVoteTopic({
        communityId: community.id,
        createdBy: creator.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { currentUser: { id: nonMember.id }, issuer } as unknown as IContext;
      const result = await voteUseCase.userGetMyVoteEligibility(ctx, { topicId: topic.id });

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("NOT_A_MEMBER");
      expect(result.currentPower).toBeNull();
    });

    it("should return eligible=false with reason=INSUFFICIENT_ROLE when user role is below requiredRole", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "Member",
        slug: "member-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: member.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
        gate: { type: "MEMBERSHIP", requiredRole: "MANAGER" }, // MANAGER 以上が必要
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;
      const result = await voteUseCase.userGetMyVoteEligibility(ctx, { topicId: topic.id });

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("INSUFFICIENT_ROLE");
      expect(result.currentPower).toBeNull();
    });

    it("should return resultVisible=true and myBallot populated when topic has ended (CLOSED)", async () => {
      // userGetMyVoteEligibility の resultVisible 計算は `now >= endsAt` のみで決まる
      // checkEligibility は gate（MEMBERSHIP）を見るため、期間終了後も eligible=true になる
      // → myBallot の resultVisible フラグが true になることで投票結果が開示される
      const user = await TestDataSourceHelper.createUser({
        name: "Closed Voter",
        slug: "closed-voter-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        // 終了済みの topic（期間は過去）
        startsAt: new Date(now.getTime() - 7_200_000),
        endsAt: new Date(now.getTime() - 60_000),
      });

      // ballot を直接作成（期間外なので userCastVote は使えない）
      const { prismaClient } = await import("@/infrastructure/prisma/client");
      await prismaClient.voteBallot.create({
        data: { userId: user.id, topicId: topic.id, optionId: optionA.id, power: 1 },
      });

      const ctx = { currentUser: { id: user.id }, issuer } as unknown as IContext;
      const result = await voteUseCase.userGetMyVoteEligibility(ctx, { topicId: topic.id });

      // 期間終了後も MEMBERSHIP gate が JOINED を確認するため eligible=true
      expect(result.eligible).toBe(true);
      // myBallot が返却される
      expect(result.myBallot).not.toBeNull();
      expect(result.myBallot?.power).toBe(1);
      // resultVisible フラグが true（期間終了 → 結果開示モード）
      expect((result.myBallot as unknown as { resultVisible: boolean }).resultVisible).toBe(true);
    });
  });
});
