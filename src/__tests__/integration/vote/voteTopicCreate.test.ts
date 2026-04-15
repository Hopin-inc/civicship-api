import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import VoteUseCase from "@/application/domain/vote/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { ValidationError } from "@/errors/graphql";
import { GqlVoteGateType, GqlVotePowerPolicyType } from "@/types/graphql";
import { createNftToken } from "./helpers";

// ─── 共通セットアップ ─────────────────────────────────────────────────────────

/** テスト用の最小有効 input を生成する。各テストで必要に応じて上書きする。 */
function makeValidInput(communityId: string, overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    communityId,
    title: "Test Vote",
    startsAt: new Date(now.getTime() + 60_000),
    endsAt: new Date(now.getTime() + 3_600_000),
    gate: { type: GqlVoteGateType.Membership },
    powerPolicy: { type: GqlVotePowerPolicyType.Flat },
    options: [
      { label: "Option A", orderIndex: 0 },
      { label: "Option B", orderIndex: 1 },
    ],
    ...overrides,
  };
}

describe("Vote Integration: VoteTopicCreate", () => {
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

  it("should create a vote topic with MEMBERSHIP gate and FLAT power policy", async () => {
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

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    const result = await voteUseCase.managerCreateVoteTopic(ctx, {
      input: makeValidInput(community.id),
      permission: { communityId: community.id },
    });

    expect(result.voteTopic.title).toBe("Test Vote");
    expect(result.voteTopic.gate.type).toBe("MEMBERSHIP");
    expect(result.voteTopic.powerPolicy.type).toBe("FLAT");
    expect(result.voteTopic.options).toHaveLength(2);
  });

  // ─── 異常系: communityId / 日付 ──────────────────────────────────────────────

  it("should throw ValidationError when communityId in input does not match permission", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-2",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const communityA = await TestDataSourceHelper.createCommunity({ name: "community-a", pointName: "pt" });
    const communityB = await TestDataSourceHelper.createCommunity({ name: "community-b", pointName: "pt" });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input: makeValidInput(communityA.id),
        permission: { communityId: communityB.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when startsAt >= endsAt", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-3",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

    const now = new Date();
    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input: makeValidInput(community.id, {
          startsAt: new Date(now.getTime() + 3_600_000),
          endsAt: new Date(now.getTime() + 60_000), // endsAt < startsAt
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  // ─── 異常系: options バリデーション ──────────────────────────────────────────

  it("should throw ValidationError when options has fewer than 2 items", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-4",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input: makeValidInput(community.id, {
          options: [{ label: "Only Option", orderIndex: 0 }], // 1 つしかない
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when an option has a negative orderIndex", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-5",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input: makeValidInput(community.id, {
          options: [
            { label: "Option A", orderIndex: -1 }, // 負のインデックス
            { label: "Option B", orderIndex: 1 },
          ],
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when options have duplicate orderIndex values", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-6",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input: makeValidInput(community.id, {
          options: [
            { label: "Option A", orderIndex: 0 },
            { label: "Option B", orderIndex: 0 }, // 重複
          ],
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  // ─── 異常系: NFT gate / NFT_COUNT policy バリデーション ──────────────────────

  it("should throw ValidationError when NFT gate is specified without nftTokenId", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-7",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input: makeValidInput(community.id, {
          gate: { type: GqlVoteGateType.Nft }, // nftTokenId なし
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when NFT_COUNT policy is specified without nftTokenId", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug-8",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({ name: "community", pointName: "pt" });

    // NFT_COUNT policy には nftTokenId が必須だが、
    // NFT gate ではなく MEMBERSHIP gate の場合でも policy 側は独立して検証される
    const nftToken = await createNftToken(); // gate 用ではなく policy 検証のため

    const ctx = { currentUser: { id: manager.id }, issuer } as unknown as IContext;
    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input: makeValidInput(community.id, {
          gate: { type: GqlVoteGateType.Membership },
          powerPolicy: {
            type: GqlVotePowerPolicyType.NftCount,
            // nftTokenId なし
          },
        }),
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);

    void nftToken; // 未使用変数の警告を抑制
  });
});
