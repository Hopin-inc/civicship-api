import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import VoteUseCase from "@/application/domain/vote/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { AuthorizationError, NotFoundError, VoteTopicNotEditableError } from "@/errors/graphql";
import { createVoteTopic } from "./helpers";

describe("Vote Integration: VoteTopicDelete", () => {
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

  // ─── 正常系 ──────────────────────────────────────────────────────────────────

  it("should delete a vote topic in UPCOMING phase and return the deleted id", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({
      name: "community",
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
    // UPCOMING: startsAt が未来
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    const result = await voteUseCase.managerDeleteVoteTopic(ctx, {
      id: topic.id,
      permission: { communityId: community.id },
    });

    expect(result.voteTopicId).toBe(topic.id);

    // Verify it is no longer in the DB
    const deleted = await prismaClient.voteTopic.findUnique({ where: { id: topic.id } });
    expect(deleted).toBeNull();
  });

  // ─── 異常系: 存在しない topic ───────────────────────────────────────────────

  it("should throw NotFoundError when the topic id does not exist", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-nf",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({
      name: "community",
      pointName: "pt",
    });
    await TestDataSourceHelper.createMembership({
      user: { connect: { id: manager.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.INVITED,
      role: Role.MANAGER,
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerDeleteVoteTopic(ctx, {
        id: "nonexistent-topic-id",
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(NotFoundError);
  });

  // ─── 異常系: communityId ──────────────────────────────────────────────────

  it("should throw AuthorizationError when topic does not belong to the specified community", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-2",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const communityA = await TestDataSourceHelper.createCommunity({
      name: "community-a",
      pointName: "pt",
    });
    const communityB = await TestDataSourceHelper.createCommunity({
      name: "community-b",
      pointName: "pt",
    });
    await TestDataSourceHelper.createMembership({
      user: { connect: { id: manager.id } },
      community: { connect: { id: communityA.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.INVITED,
      role: Role.MANAGER,
    });

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: communityA.id, // topic belongs to communityA
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerDeleteVoteTopic(ctx, {
        id: topic.id,
        permission: { communityId: communityB.id }, // wrong community
      }),
    ).rejects.toThrow(AuthorizationError);
  });

  // ─── 異常系: フェーズ制約 ─────────────────────────────────────────────────

  it("should throw VoteTopicNotEditableError when deleting a topic in OPEN phase", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-open",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({
      name: "community",
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
    // OPEN: 過去に開始 / 未来に終了
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() - 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerDeleteVoteTopic(ctx, {
        id: topic.id,
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(VoteTopicNotEditableError);

    // DB 上の topic は残っているはず
    const stillExists = await prismaClient.voteTopic.findUnique({ where: { id: topic.id } });
    expect(stillExists).not.toBeNull();
  });

  it("should throw VoteTopicNotEditableError when deleting a topic in CLOSED phase", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-closed",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({
      name: "community",
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
    // CLOSED: 両方過去
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() - 3_600_000),
      endsAt: new Date(now.getTime() - 60_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerDeleteVoteTopic(ctx, {
        id: topic.id,
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(VoteTopicNotEditableError);

    const stillExists = await prismaClient.voteTopic.findUnique({ where: { id: topic.id } });
    expect(stillExists).not.toBeNull();
  });

  // ─── カスケード削除の確認（DB-level、usecase バリデーションをバイパス）──────────

  // usecase 経由での削除は UPCOMING 限定なので ballot は存在し得ないが、
  // Prisma schema の onDelete: Cascade 自体はセーフティネットとして検証しておく。
  // そのため prismaClient.voteTopic.delete() を直接呼び出して純粋に DB-level cascade を確認する。
  it("should cascade-delete gate, powerPolicy, options and ballots when voteTopic is removed at DB level", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-3",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const voter = await TestDataSourceHelper.createUser({
      name: "Voter",
      slug: "voter-slug-3",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({
      name: "community",
      pointName: "pt",
    });
    await TestDataSourceHelper.createMembership({
      user: { connect: { id: manager.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.INVITED,
      role: Role.MANAGER,
    });
    await TestDataSourceHelper.createMembership({
      user: { connect: { id: voter.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.INVITED,
      role: Role.MEMBER,
    });

    const now = new Date();
    const { topic, optionA } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() - 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    // Create a ballot directly to verify cascade deletion
    await prismaClient.voteBallot.create({
      data: {
        userId: voter.id,
        topicId: topic.id,
        optionId: optionA.id,
        power: 1,
      },
    });

    // Confirm all records exist before deletion
    const gateBefore = await prismaClient.voteGate.findFirst({ where: { topicId: topic.id } });
    const policyBefore = await prismaClient.votePowerPolicy.findFirst({
      where: { topicId: topic.id },
    });
    const optionsBefore = await prismaClient.voteOption.findMany({ where: { topicId: topic.id } });
    const ballotBefore = await prismaClient.voteBallot.findFirst({ where: { topicId: topic.id } });

    expect(gateBefore).not.toBeNull();
    expect(policyBefore).not.toBeNull();
    expect(optionsBefore).toHaveLength(2);
    expect(ballotBefore).not.toBeNull();

    // Delete the topic directly at DB level (bypassing usecase validation) to verify schema-level cascade
    await prismaClient.voteTopic.delete({ where: { id: topic.id } });

    // All related records should be cascade-deleted
    const gateAfter = await prismaClient.voteGate.findFirst({ where: { topicId: topic.id } });
    const policyAfter = await prismaClient.votePowerPolicy.findFirst({
      where: { topicId: topic.id },
    });
    const optionsAfter = await prismaClient.voteOption.findMany({ where: { topicId: topic.id } });
    const ballotAfter = await prismaClient.voteBallot.findFirst({ where: { topicId: topic.id } });

    expect(gateAfter).toBeNull();
    expect(policyAfter).toBeNull();
    expect(optionsAfter).toHaveLength(0);
    expect(ballotAfter).toBeNull();
  });
});
