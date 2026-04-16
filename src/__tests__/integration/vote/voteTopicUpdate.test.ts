import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import VoteUseCase from "@/application/domain/vote/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
  VoteTopicNotEditableError,
} from "@/errors/graphql";
import { GqlVoteGateType, GqlVotePowerPolicyType } from "@/types/graphql";
import { createNftToken, createVoteTopic } from "./helpers";

// ─── 共通セットアップ ─────────────────────────────────────────────────────────

/** Update 用の最小有効 input を生成する。各テストで必要に応じて上書きする。 */
function makeValidUpdateInput(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    title: "Updated Vote",
    description: "Updated description",
    startsAt: new Date(now.getTime() + 120_000),
    endsAt: new Date(now.getTime() + 7_200_000),
    gate: { type: GqlVoteGateType.Membership },
    powerPolicy: { type: GqlVotePowerPolicyType.Flat },
    options: [
      { label: "Updated Option A", orderIndex: 0 },
      { label: "Updated Option B", orderIndex: 1 },
    ],
    ...overrides,
  };
}

async function setupManagerAndCommunity(slug: string) {
  const manager = await TestDataSourceHelper.createUser({
    name: "Manager",
    slug,
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
  return { manager, community };
}

describe("Vote Integration: VoteTopicUpdate", () => {
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

  // ─── 正常系: UPCOMING ─────────────────────────────────────────────────────

  it("should update all fields of a UPCOMING topic", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-1");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    const result = await voteUseCase.managerUpdateVoteTopic(ctx, {
      id: topic.id,
      input: makeValidUpdateInput({ title: "Brand New Title" }),
      permission: { communityId: community.id },
    });

    expect(result.voteTopic.title).toBe("Brand New Title");
    expect(result.voteTopic.description).toBe("Updated description");
    expect(result.voteTopic.options).toHaveLength(2);
    expect(result.voteTopic.options[0].label).toBe("Updated Option A");
    expect(result.voteTopic.options[1].label).toBe("Updated Option B");
    expect(result.voteTopic.gate.type).toBe("MEMBERSHIP");
    expect(result.voteTopic.powerPolicy.type).toBe("FLAT");

    // 旧 options が完全に置き換わっていることを DB 側でも確認
    const optionsInDb = await prismaClient.voteOption.findMany({
      where: { topicId: topic.id },
      orderBy: { orderIndex: "asc" },
    });
    expect(optionsInDb).toHaveLength(2);
    expect(optionsInDb.map((o) => o.label)).toEqual(["Updated Option A", "Updated Option B"]);
  });

  it("should replace options entirely (count and labels)", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-options");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await voteUseCase.managerUpdateVoteTopic(ctx, {
      id: topic.id,
      input: makeValidUpdateInput({
        options: [
          { label: "New A", orderIndex: 0 },
          { label: "New B", orderIndex: 1 },
          { label: "New C", orderIndex: 2 },
        ],
      }),
      permission: { communityId: community.id },
    });

    const optionsInDb = await prismaClient.voteOption.findMany({
      where: { topicId: topic.id },
      orderBy: { orderIndex: "asc" },
    });
    expect(optionsInDb).toHaveLength(3);
    expect(optionsInDb.map((o) => o.label)).toEqual(["New A", "New B", "New C"]);
  });

  it("should switch gate type from MEMBERSHIP to NFT", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-gate");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const nftToken = await createNftToken();

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    const result = await voteUseCase.managerUpdateVoteTopic(ctx, {
      id: topic.id,
      input: makeValidUpdateInput({
        gate: { type: GqlVoteGateType.Nft, nftTokenId: nftToken.id },
      }),
      permission: { communityId: community.id },
    });

    expect(result.voteTopic.gate.type).toBe("NFT");
    expect((result.voteTopic.gate as any).nftTokenId).toBe(nftToken.id);
  });

  it("should switch powerPolicy type from FLAT to NFT_COUNT", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-policy");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const nftToken = await createNftToken();

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    const result = await voteUseCase.managerUpdateVoteTopic(ctx, {
      id: topic.id,
      input: makeValidUpdateInput({
        powerPolicy: { type: GqlVotePowerPolicyType.NftCount, nftTokenId: nftToken.id },
      }),
      permission: { communityId: community.id },
    });

    expect(result.voteTopic.powerPolicy.type).toBe("NFT_COUNT");
    expect((result.voteTopic.powerPolicy as any).nftTokenId).toBe(nftToken.id);
  });

  // ─── 異常系: フェーズ制約 ─────────────────────────────────────────────────

  it("should throw VoteTopicNotEditableError when updating a topic in OPEN phase", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-open");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() - 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerUpdateVoteTopic(ctx, {
        id: topic.id,
        input: makeValidUpdateInput(),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(VoteTopicNotEditableError);
  });

  it("should throw VoteTopicNotEditableError when updating a topic in CLOSED phase", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-closed");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() - 3_600_000),
      endsAt: new Date(now.getTime() - 60_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerUpdateVoteTopic(ctx, {
        id: topic.id,
        input: makeValidUpdateInput(),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(VoteTopicNotEditableError);
  });

  // ─── 異常系: 存在しない / 別コミュニティ ─────────────────────────────────

  it("should throw NotFoundError when the topic id does not exist", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-nf");

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerUpdateVoteTopic(ctx, {
        id: "nonexistent-topic-id",
        input: makeValidUpdateInput(),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw AuthorizationError when topic does not belong to the specified community", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-upd-auth",
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
      communityId: communityA.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerUpdateVoteTopic(ctx, {
        id: topic.id,
        input: makeValidUpdateInput(),
        permission: { communityId: communityB.id },
      }),
    ).rejects.toThrow(AuthorizationError);
  });

  // ─── 異常系: 入力バリデーション ───────────────────────────────────────────

  it("should throw ValidationError when endsAt <= startsAt", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-date");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerUpdateVoteTopic(ctx, {
        id: topic.id,
        input: makeValidUpdateInput({
          startsAt: new Date(now.getTime() + 3_600_000),
          endsAt: new Date(now.getTime() + 60_000),
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when options has fewer than 2 items", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-opts1");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerUpdateVoteTopic(ctx, {
        id: topic.id,
        input: makeValidUpdateInput({
          options: [{ label: "Only", orderIndex: 0 }],
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when options have duplicate orderIndex values", async () => {
    const { manager, community } = await setupManagerAndCommunity("manager-upd-opts2");

    const now = new Date();
    const { topic } = await createVoteTopic({
      communityId: community.id,
      createdBy: manager.id,
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
    });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerUpdateVoteTopic(ctx, {
        id: topic.id,
        input: makeValidUpdateInput({
          options: [
            { label: "A", orderIndex: 0 },
            { label: "B", orderIndex: 0 },
          ],
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });
});
