import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import VoteUseCase from "@/application/domain/vote/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { AuthorizationError, NotFoundError, ValidationError } from "@/errors/graphql";

async function createVoteTopic(params: {
  communityId: string;
  createdBy: string;
  startsAt: Date;
  endsAt: Date;
  gateType?: "MEMBERSHIP" | "NFT";
  policyType?: "FLAT" | "NFT_COUNT";
}) {
  const {
    communityId,
    createdBy,
    startsAt,
    endsAt,
    gateType = "MEMBERSHIP",
    policyType = "FLAT",
  } = params;

  const topic = await prismaClient.voteTopic.create({
    data: { communityId, createdBy, title: "Integration Test Vote", startsAt, endsAt },
  });

  await prismaClient.voteGate.create({ data: { type: gateType, topicId: topic.id } });
  await prismaClient.votePowerPolicy.create({ data: { type: policyType, topicId: topic.id } });

  const optionA = await prismaClient.voteOption.create({
    data: { topicId: topic.id, label: "Option A", orderIndex: 0 },
  });
  const optionB = await prismaClient.voteOption.create({
    data: { topicId: topic.id, label: "Option B", orderIndex: 1 },
  });

  return { topic, optionA, optionB };
}

describe("Vote Integration: VoteCast", () => {
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

  describe("initial vote", () => {
    it("should allow a community member to cast a vote", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "Voter",
        slug: "voter-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "vote-community",
        pointName: "pt",
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: member.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;

      const result = await voteUseCase.userCastVote(ctx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      expect(result.ballot.power).toBe(1);

      const updated = await prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } });
      expect(updated.voteCount).toBe(1);
      expect(updated.totalPower).toBe(1);
    });
  });

  describe("revote", () => {
    it("should decrement old option and increment new option when changing option", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "Revote User",
        slug: "revote-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "revote-community",
        pointName: "pt",
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: member.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic, optionA, optionB } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;

      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } });
      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionB.id } });

      const [updatedA, updatedB] = await Promise.all([
        prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } }),
        prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionB.id } }),
      ]);

      // Option A の投票が取り消され Option B に移っていること
      expect(updatedA.voteCount).toBe(0);
      expect(updatedA.totalPower).toBe(0);
      expect(updatedB.voteCount).toBe(1);
      expect(updatedB.totalPower).toBe(1);
    });

    it("should NOT change voteCount when re-voting for the same option (adjustOptionTotalPower path)", async () => {
      // FLAT policy では power=1 が固定なので delta=0 となり DB 更新は何も起きない
      // このテストは「同一選択肢への再投票でも voteCount が二重加算されない」ことを保証する
      const member = await TestDataSourceHelper.createUser({
        name: "Same Option Voter",
        slug: "same-option-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "same-option-community",
        pointName: "pt",
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: member.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;

      // 同じ選択肢に2回投票
      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } });
      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } });

      const updated = await prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } });

      // voteCount は 1 のまま（2 にならない）
      expect(updated.voteCount).toBe(1);
      expect(updated.totalPower).toBe(1);
    });
  });

  describe("gate enforcement", () => {
    it("should reject a user without community membership (MEMBERSHIP gate)", async () => {
      const nonMember = await TestDataSourceHelper.createUser({
        name: "NonMember",
        slug: "non-member-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const creator = await TestDataSourceHelper.createUser({
        name: "Creator",
        slug: "creator-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "gate-community",
        pointName: "pt",
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: creator.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { currentUser: { id: nonMember.id }, issuer } as unknown as IContext;

      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should reject a user whose membership status is not JOINED", async () => {
      const pendingUser = await TestDataSourceHelper.createUser({
        name: "Pending User",
        slug: "pending-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "pending-community",
        pointName: "pt",
      });

      // PENDING（未承認）状態のメンバーシップ
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: pendingUser.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.PENDING,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: pendingUser.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = { currentUser: { id: pendingUser.id }, issuer } as unknown as IContext;

      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("voting period enforcement", () => {
    it("should reject votes before voting period starts", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "EarlyVoter",
        slug: "early-voter-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "early-vote-community",
        pointName: "pt",
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: member.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        startsAt: new Date(now.getTime() + 3_600_000),
        endsAt: new Date(now.getTime() + 7_200_000),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;

      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(ValidationError);
    });

    it("should reject votes after voting period ends", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "LateVoter",
        slug: "late-voter-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "late-vote-community",
        pointName: "pt",
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: member.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        startsAt: new Date(now.getTime() - 7_200_000),
        endsAt: new Date(now.getTime() - 3_600_000),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;

      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("option validation", () => {
    it("should reject a vote for an optionId that does not belong to the topic", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "WrongOption Voter",
        slug: "wrong-option-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "wrong-option-community",
        pointName: "pt",
      });

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
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;

      await expect(
        voteUseCase.userCastVote(ctx, {
          input: { topicId: topic.id, optionId: "nonexistent-option-id" },
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("result masking", () => {
    it("should hide voteCount/totalPower from a regular member during active voting period", async () => {
      const manager = await TestDataSourceHelper.createUser({
        name: "Manager",
        slug: "manager-masking-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const member = await TestDataSourceHelper.createUser({
        name: "Member",
        slug: "member-masking-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "masking-community",
        pointName: "pt",
      });

      await Promise.all([
        TestDataSourceHelper.createMembership({
          user: { connect: { id: manager.id } },
          community: { connect: { id: community.id } },
          status: MembershipStatus.JOINED,
          reason: MembershipStatusReason.INVITED,
          role: Role.MANAGER,
        }),
        TestDataSourceHelper.createMembership({
          user: { connect: { id: member.id } },
          community: { connect: { id: community.id } },
          status: MembershipStatus.JOINED,
          reason: MembershipStatusReason.INVITED,
          role: Role.MEMBER,
        }),
      ]);

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: manager.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const memberCtx = {
        currentUser: {
          id: member.id,
          memberships: [{ communityId: community.id, role: Role.MEMBER, status: MembershipStatus.JOINED }],
        },
        issuer,
      } as unknown as IContext;

      await voteUseCase.userCastVote(memberCtx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      const result = await voteUseCase.anyoneBrowseVoteTopics(memberCtx, {
        communityId: community.id,
        first: 10,
      });

      const optionNode = result.nodes[0].options.find((o) => o.orderIndex === 0);
      // 投票期間中は一般メンバーには集計値が隠される
      expect(optionNode?.voteCount).toBeNull();
      expect(optionNode?.totalPower).toBeNull();
    });

    it("should show voteCount/totalPower to a manager during active voting period", async () => {
      // マネージャーは投票期間中でも集計値を参照できる（isResultVisible = true）
      const manager = await TestDataSourceHelper.createUser({
        name: "Manager Visible",
        slug: "manager-visible-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "manager-visible-community",
        pointName: "pt",
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: manager.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MANAGER,
      });

      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: manager.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000), // 投票期間中
      });

      const managerCtx = {
        currentUser: {
          id: manager.id,
          memberships: [{ communityId: community.id, role: Role.MANAGER, status: MembershipStatus.JOINED }],
        },
        issuer,
      } as unknown as IContext;

      await voteUseCase.userCastVote(managerCtx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      const result = await voteUseCase.anyoneBrowseVoteTopics(managerCtx, {
        communityId: community.id,
        first: 10,
      });

      const optionNode = result.nodes[0].options.find((o) => o.orderIndex === 0);
      // マネージャーは投票期間中でも集計値が見える
      expect(optionNode?.voteCount).toBe(1);
      expect(optionNode?.totalPower).toBe(1);
    });

    it("should show voteCount/totalPower to any user after voting period ends", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Regular User",
        slug: "regular-user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "ended-community",
        pointName: "pt",
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const now = new Date();
      const { optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() - 7_200_000),
        endsAt: new Date(now.getTime() - 3_600_000), // 終了済み
      });

      // 集計カラムを直接設定（終了済みトピックには投票できないため）
      await prismaClient.voteOption.update({
        where: { id: optionA.id },
        data: { voteCount: 3, totalPower: 5 },
      });

      const memberCtx = {
        currentUser: {
          id: user.id,
          memberships: [{ communityId: community.id, role: Role.MEMBER, status: MembershipStatus.JOINED }],
        },
        issuer,
      } as unknown as IContext;

      const result = await voteUseCase.anyoneBrowseVoteTopics(memberCtx, {
        communityId: community.id,
        first: 10,
      });

      const optionNode = result.nodes[0].options.find((o) => o.orderIndex === 0);
      // endsAt 後は一般ユーザーにも集計値が公開される
      expect(optionNode?.voteCount).toBe(3);
      expect(optionNode?.totalPower).toBe(5);
    });
  });
});
