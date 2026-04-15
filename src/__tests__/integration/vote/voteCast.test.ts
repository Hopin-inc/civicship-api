import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import VoteUseCase from "@/application/domain/vote/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { AuthorizationError, NotFoundError, ValidationError } from "@/errors/graphql";
import { createVoteTopic, createOwnedNft, createNftToken } from "./helpers";

// ─── 共通セットアップ ─────────────────────────────────────────────────────────

/** アクティブな投票期間（1分前開始・1時間後終了）を返す */
function activePeriod() {
  const now = new Date();
  return {
    startsAt: new Date(now.getTime() - 60_000),
    endsAt: new Date(now.getTime() + 3_600_000),
  };
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

  // ─── 初回投票 ─────────────────────────────────────────────────────────────

  describe("initial vote", () => {
    it("should allow a community member to cast a vote (MEMBERSHIP/FLAT)", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "Voter",
        slug: "voter-slug",
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

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        ...activePeriod(),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;
      const result = await voteUseCase.userCastVote(ctx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      // 返り値の確認
      expect(result.ballot.power).toBe(1);

      // DB の集計カラム確認
      const updated = await prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } });
      expect(updated.voteCount).toBe(1);
      expect(updated.totalPower).toBe(1);
    });
  });

  // ─── NFT ゲート ──────────────────────────────────────────────────────────

  describe("gate enforcement (NFT)", () => {
    it("should allow a vote when the user holds the required NFT", async () => {
      const voter = await TestDataSourceHelper.createUser({
        name: "NFT Holder",
        slug: "nft-holder-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

      // NftToken + NftWallet + NftInstance(OWNED) を作成
      const { nftToken } = await createOwnedNft(voter.id);

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: voter.id,
        ...activePeriod(),
        gate: { type: "NFT", nftTokenId: nftToken.id },
      });

      const ctx = { currentUser: { id: voter.id }, issuer } as unknown as IContext;
      const result = await voteUseCase.userCastVote(ctx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      expect(result.ballot.power).toBe(1);
      const updated = await prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } });
      expect(updated.voteCount).toBe(1);
    });

    it("should reject a vote when the user does not hold the required NFT (REQUIRED_NFT_NOT_FOUND)", async () => {
      const voter = await TestDataSourceHelper.createUser({
        name: "No NFT",
        slug: "no-nft-gate-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

      // NftToken は作成するがユーザーに NftInstance は付与しない
      const nftToken = await createNftToken();

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: voter.id,
        ...activePeriod(),
        gate: { type: "NFT", nftTokenId: nftToken.id },
      });

      const ctx = { currentUser: { id: voter.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(AuthorizationError);
    });
  });

  // ─── NFT_COUNT policy: power > 1 ────────────────────────────────────────

  describe("voting power (NFT_COUNT)", () => {
    it("should record power=2 when the user holds 2 NFTs under NFT_COUNT policy", async () => {
      const voter = await TestDataSourceHelper.createUser({
        name: "Multi NFT Voter",
        slug: "multi-nft-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: voter.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      // 同一 NftToken に対して 2 枚の NftInstance を付与
      const { nftToken, nftWallet } = await createOwnedNft(voter.id);
      await prismaClient.nftInstance.create({
        data: {
          instanceId: `instance-2nd-${Date.now()}`,
          nftTokenId: nftToken.id,
          nftWalletId: nftWallet.id,
          status: "OWNED",
        },
      });

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: voter.id,
        ...activePeriod(),
        gate: { type: "MEMBERSHIP" },
        policy: { type: "NFT_COUNT", nftTokenId: nftToken.id },
      });

      const ctx = { currentUser: { id: voter.id }, issuer } as unknown as IContext;
      const result = await voteUseCase.userCastVote(ctx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });

      // power=2 で投票が記録され、totalPower も 2 になること
      expect(result.ballot.power).toBe(2);
      const updated = await prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } });
      expect(updated.voteCount).toBe(1);
      expect(updated.totalPower).toBe(2);
    });
  });

  // ─── 再投票 ───────────────────────────────────────────────────────────────

  describe("revote", () => {
    it("should decrement old option and increment new option when changing option", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "Revote User",
        slug: "revote-slug",
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

      const { topic, optionA, optionB } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        ...activePeriod(),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;

      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } });
      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionB.id } });

      const [updatedA, updatedB] = await Promise.all([
        prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } }),
        prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionB.id } }),
      ]);

      expect(updatedA.voteCount).toBe(0);
      expect(updatedA.totalPower).toBe(0);
      expect(updatedB.voteCount).toBe(1);
      expect(updatedB.totalPower).toBe(1);
    });

    it("should NOT change voteCount when re-voting for the same option (adjustOptionTotalPower path)", async () => {
      // FLAT policy では power=1 固定なので delta=0 → DB 更新なし
      // このテストは voteCount が二重加算されないことを保証する
      const member = await TestDataSourceHelper.createUser({
        name: "Same Option Voter",
        slug: "same-option-slug",
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

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        ...activePeriod(),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;
      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } });
      await voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } });

      const updated = await prismaClient.voteOption.findUniqueOrThrow({ where: { id: optionA.id } });
      expect(updated.voteCount).toBe(1); // 2 にならない
      expect(updated.totalPower).toBe(1);
    });
  });

  // ─── ゲート強制 ───────────────────────────────────────────────────────────

  describe("gate enforcement (MEMBERSHIP)", () => {
    it("should reject a user with no membership", async () => {
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
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: creator.id,
        ...activePeriod(),
      });

      const ctx = { currentUser: { id: nonMember.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should reject a user whose membership status is PENDING", async () => {
      const pendingUser = await TestDataSourceHelper.createUser({
        name: "Pending",
        slug: "pending-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: pendingUser.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.PENDING,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: pendingUser.id,
        ...activePeriod(),
      });

      const ctx = { currentUser: { id: pendingUser.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should reject a user whose membership status is LEFT", async () => {
      const leftUser = await TestDataSourceHelper.createUser({
        name: "Left User",
        slug: "left-user-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
      await TestDataSourceHelper.createMembership({
        user: { connect: { id: leftUser.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.LEFT,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: leftUser.id,
        ...activePeriod(),
      });

      const ctx = { currentUser: { id: leftUser.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should reject a MEMBER when requiredRole is MANAGER", async () => {
      // requiredRole=MANAGER に対して MEMBER ロールでは INSUFFICIENT_ROLE
      const member = await TestDataSourceHelper.createUser({
        name: "Member",
        slug: "member-role-slug",
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

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        ...activePeriod(),
        gate: { type: "MEMBERSHIP", requiredRole: "MANAGER" },
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should allow a MANAGER when requiredRole is MANAGER", async () => {
      const manager = await TestDataSourceHelper.createUser({
        name: "Manager",
        slug: "manager-role-slug",
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

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: manager.id,
        ...activePeriod(),
        gate: { type: "MEMBERSHIP", requiredRole: "MANAGER" },
      });

      const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
      const result = await voteUseCase.userCastVote(ctx, {
        input: { topicId: topic.id, optionId: optionA.id },
      });
      expect(result.ballot.power).toBe(1);
    });
  });

  // ─── 投票期間外 ────────────────────────────────────────────────────────────

  describe("voting period enforcement", () => {
    it("should reject votes before voting period starts", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "Early",
        slug: "early-slug",
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
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        startsAt: new Date(now.getTime() + 3_600_000), // 1時間後に開始
        endsAt: new Date(now.getTime() + 7_200_000),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(ValidationError);
    });

    it("should reject votes after voting period ends", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "Late",
        slug: "late-slug",
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
      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        startsAt: new Date(now.getTime() - 7_200_000),
        endsAt: new Date(now.getTime() - 3_600_000), // 1時間前に終了
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(ValidationError);
    });
  });

  // ─── 選択肢バリデーション ──────────────────────────────────────────────────

  describe("option validation", () => {
    it("should reject a vote for an optionId that does not belong to the topic", async () => {
      const member = await TestDataSourceHelper.createUser({
        name: "Voter",
        slug: "wrong-opt-slug",
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

      const { topic } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        ...activePeriod(),
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, {
          input: { topicId: topic.id, optionId: "nonexistent-option-id" },
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── power=0 ──────────────────────────────────────────────────────────────

  describe("voting power enforcement", () => {
    it("should reject a vote when calculated power is 0 (NFT_COUNT policy, no NFTs owned)", async () => {
      // MEMBERSHIP gate（資格あり） + NFT_COUNT policy（NFT 未保有 → power=0）
      const member = await TestDataSourceHelper.createUser({
        name: "No NFT Voter",
        slug: "no-nft-slug",
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

      // ユーザーには NftInstance を与えない
      const nftToken = await createNftToken();

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: member.id,
        ...activePeriod(),
        gate: { type: "MEMBERSHIP" },
        policy: { type: "NFT_COUNT", nftTokenId: nftToken.id },
      });

      const ctx = { currentUser: { id: member.id }, issuer } as unknown as IContext;
      await expect(
        voteUseCase.userCastVote(ctx, { input: { topicId: topic.id, optionId: optionA.id } }),
      ).rejects.toThrow(ValidationError);
    });
  });

  // ─── 集計値マスキング ────────────────────────────────────────────────────

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
      const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });
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

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: manager.id,
        ...activePeriod(),
      });

      const memberCtx = {
        currentUser: {
          id: member.id,
          memberships: [{ communityId: community.id, role: Role.MEMBER }],
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
      expect(optionNode?.voteCount).toBeNull();
      expect(optionNode?.totalPower).toBeNull();
    });

    it("should show voteCount/totalPower to a manager during active voting period", async () => {
      const manager = await TestDataSourceHelper.createUser({
        name: "Manager Visible",
        slug: "manager-visible-slug",
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

      const { topic, optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: manager.id,
        ...activePeriod(),
      });

      const managerCtx = {
        currentUser: {
          id: manager.id,
          memberships: [{ communityId: community.id, role: Role.MANAGER }],
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
      expect(optionNode?.voteCount).toBe(1);
      expect(optionNode?.totalPower).toBe(1);
    });

    it("should show voteCount/totalPower to any user after voting period ends", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Regular",
        slug: "regular-ended-slug",
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
      const { optionA } = await createVoteTopic({
        communityId: community.id,
        createdBy: user.id,
        startsAt: new Date(now.getTime() - 7_200_000),
        endsAt: new Date(now.getTime() - 3_600_000), // 終了済み
      });

      await prismaClient.voteOption.update({
        where: { id: optionA.id },
        data: { voteCount: 3, totalPower: 5 },
      });

      const ctx = {
        currentUser: {
          id: user.id,
          memberships: [{ communityId: community.id, role: Role.MEMBER }],
        },
        issuer,
      } as unknown as IContext;

      const result = await voteUseCase.anyoneBrowseVoteTopics(ctx, {
        communityId: community.id,
        first: 10,
      });

      const optionNode = result.nodes[0].options.find((o) => o.orderIndex === 0);
      expect(optionNode?.voteCount).toBe(3);
      expect(optionNode?.totalPower).toBe(5);
    });
  });
});
