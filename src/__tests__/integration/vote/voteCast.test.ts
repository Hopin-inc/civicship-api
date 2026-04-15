import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import VoteUseCase from "@/application/domain/vote/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { AuthorizationError, ValidationError } from "@/errors/graphql";

// topicId の DB レコードを直接作成するユーティリティ
// (vote topic は usecase 経由で作成するので不要だが、
//  startsAt/endsAt を任意に制御したいケースでは直接 Prisma 操作を使う)
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
    data: {
      communityId,
      createdBy,
      title: "Integration Test Vote",
      startsAt,
      endsAt,
    },
  });

  await prismaClient.voteGate.create({
    data: { type: gateType, topicId: topic.id },
  });

  await prismaClient.votePowerPolicy.create({
    data: { type: policyType, topicId: topic.id },
  });

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
        startsAt: new Date(now.getTime() - 60_000), // 1 min ago
        endsAt: new Date(now.getTime() + 3_600_000), // 1 hour from now
      });

      const ctx = {
        currentUser: { id: member.id },
        issuer,
      } as unknown as IContext;

      const result = await voteUseCase.userCastVote(ctx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      expect(result.ballot).toBeDefined();
      expect(result.ballot.power).toBe(1);

      // VoteOption の集計カラムが更新されているかを確認
      const updatedOption = await prismaClient.voteOption.findUniqueOrThrow({
        where: { id: optionA.id },
      });
      expect(updatedOption.voteCount).toBe(1);
      expect(updatedOption.totalPower).toBe(1);
    });
  });

  describe("revote (changing option)", () => {
    it("should update ballot and adjust option counts correctly on revote", async () => {
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

      const ctx = {
        currentUser: { id: member.id },
        issuer,
      } as unknown as IContext;

      // 1st vote: Option A
      await voteUseCase.userCastVote(ctx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      // 2nd vote: Option B (revote)
      const revoteResult = await voteUseCase.userCastVote(ctx, {
        input: { topicId: topic.id, optionId: optionB.id },
      });

      expect(revoteResult.ballot).toBeDefined();

      // Option A の count が 0 に戻り、Option B が 1 になっているかを確認
      const [updatedA, updatedB] = await Promise.all([
        prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } }),
        prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionB.id } }),
      ]);

      expect(updatedA.voteCount).toBe(0);
      expect(updatedA.totalPower).toBe(0);
      expect(updatedB.voteCount).toBe(1);
      expect(updatedB.totalPower).toBe(1);
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

      // nonMember は membership を持たない
      const now = new Date();
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: creator.id,
        startsAt: new Date(now.getTime() - 60_000),
        endsAt: new Date(now.getTime() + 3_600_000),
      });

      const ctx = {
        currentUser: { id: nonMember.id },
        issuer,
      } as unknown as IContext;

      await expect(
        voteUseCase.userCastVote(ctx, {
          input: { topicId: topic.id, optionId: optionA.id },
        }),
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
        startsAt: new Date(now.getTime() + 3_600_000), // starts 1 hour in the future
        endsAt: new Date(now.getTime() + 7_200_000),
      });

      const ctx = {
        currentUser: { id: member.id },
        issuer,
      } as unknown as IContext;

      await expect(
        voteUseCase.userCastVote(ctx, {
          input: { topicId: topic.id, optionId: optionA.id },
        }),
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
        startsAt: new Date(now.getTime() - 7_200_000), // started 2 hours ago
        endsAt: new Date(now.getTime() - 3_600_000), // ended 1 hour ago
      });

      const ctx = {
        currentUser: { id: member.id },
        issuer,
      } as unknown as IContext;

      await expect(
        voteUseCase.userCastVote(ctx, {
          input: { topicId: topic.id, optionId: optionA.id },
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("result masking", () => {
    it("should hide voteCount/totalPower during active voting period when browsing topics", async () => {
      const manager = await TestDataSourceHelper.createUser({
        name: "Manager Result",
        slug: "manager-result-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const member = await TestDataSourceHelper.createUser({
        name: "Member Result",
        slug: "member-result-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "result-community",
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
        endsAt: new Date(now.getTime() + 3_600_000), // still active
      });

      const memberCtx = {
        currentUser: {
          id: member.id,
          memberships: [{ communityId: community.id, role: Role.MEMBER, status: MembershipStatus.JOINED }],
        },
        issuer,
      } as unknown as IContext;

      // 投票を実施
      await voteUseCase.userCastVote(memberCtx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      // 一般ユーザー（非マネージャー）として一覧取得 → 集計値は null であるべき
      const browseResult = await voteUseCase.anyoneBrowseVoteTopics(memberCtx, {
        communityId: community.id,
        first: 10,
      });

      expect(browseResult.nodes).toHaveLength(1);
      const topicNode = browseResult.nodes[0];
      const optionANode = topicNode.options.find((o) => o.orderIndex === 0);
      expect(optionANode?.voteCount).toBeNull();
      expect(optionANode?.totalPower).toBeNull();
    });

    it("should show voteCount/totalPower after voting period ends", async () => {
      const manager = await TestDataSourceHelper.createUser({
        name: "Manager Ended",
        slug: "manager-ended-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "ended-community",
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
      // 終了済みトピックを直接 DB に作成（usecase を使うと startsAt バリデーションが通らないため）
      const { optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: manager.id,
        startsAt: new Date(now.getTime() - 7_200_000), // 2 hours ago
        endsAt: new Date(now.getTime() - 3_600_000), // ended 1 hour ago
      });

      // 集計カラムを直接更新して「投票済み」状態を再現
      await prismaClient.voteOption.update({
        where: { id: optionA.id },
        data: { voteCount: 3, totalPower: 5 },
      });

      // 非マネージャーとして閲覧 → endsAt 経過後は集計値が見えるべき
      const ctx = {
        currentUser: {
          id: manager.id,
          memberships: [{ communityId: community.id, role: Role.MEMBER, status: MembershipStatus.JOINED }],
        },
        issuer,
      } as unknown as IContext;

      const browseResult = await voteUseCase.anyoneBrowseVoteTopics(ctx, {
        communityId: community.id,
        first: 10,
      });

      expect(browseResult.nodes).toHaveLength(1);
      const optionNode = browseResult.nodes[0].options.find((o) => o.orderIndex === 0);
      expect(optionNode?.voteCount).toBe(3);
      expect(optionNode?.totalPower).toBe(5);
    });
  });
});
