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

  it("should create a vote topic with MEMBERSHIP gate and FLAT power policy", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager",
      slug: "manager-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "test-community",
      pointName: "pt",
    });

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: manager.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.INVITED,
      role: Role.MANAGER,
    });

    const ctx = {
      currentUser: {
        id: manager.id,
        memberships: [{ communityId: community.id, role: Role.MANAGER, status: MembershipStatus.JOINED }],
      },
      issuer,
    } as unknown as IContext;

    const now = new Date();
    const startsAt = new Date(now.getTime() + 60_000);
    const endsAt = new Date(now.getTime() + 3_600_000);

    const input = {
      communityId: community.id,
      title: "Test Vote",
      description: "Test description",
      startsAt,
      endsAt,
      gate: { type: GqlVoteGateType.Membership },
      powerPolicy: { type: GqlVotePowerPolicyType.Flat },
      options: [
        { label: "Option A", orderIndex: 0 },
        { label: "Option B", orderIndex: 1 },
      ],
    };

    const result = await voteUseCase.managerCreateVoteTopic(ctx, {
      input,
      permission: { communityId: community.id },
    });

    expect(result.voteTopic).toBeDefined();
    expect(result.voteTopic.title).toBe("Test Vote");
    expect(result.voteTopic.gate.type).toBe("MEMBERSHIP");
    expect(result.voteTopic.powerPolicy.type).toBe("FLAT");
    expect(result.voteTopic.options).toHaveLength(2);
    expect(result.voteTopic.options.map((o) => o.label).sort()).toEqual(["Option A", "Option B"]);
  });

  it("should throw ValidationError when communityId in input does not match permission", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager2",
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

    const ctx = {
      currentUser: { id: manager.id },
      issuer,
    } as unknown as IContext;

    const now = new Date();
    const input = {
      communityId: communityA.id,
      title: "Mismatched Topic",
      startsAt: new Date(now.getTime() + 60_000),
      endsAt: new Date(now.getTime() + 3_600_000),
      gate: { type: GqlVoteGateType.Membership },
      powerPolicy: { type: GqlVotePowerPolicyType.Flat },
      options: [
        { label: "Option A", orderIndex: 0 },
        { label: "Option B", orderIndex: 1 },
      ],
    };

    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input,
        permission: { communityId: communityB.id },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when startsAt is not before endsAt", async () => {
    const manager = await TestDataSourceHelper.createUser({
      name: "Manager3",
      slug: "manager-slug-3",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-date-check",
      pointName: "pt",
    });

    const ctx = {
      currentUser: { id: manager.id },
      issuer,
    } as unknown as IContext;

    const now = new Date();
    const input = {
      communityId: community.id,
      title: "Bad Date Topic",
      startsAt: new Date(now.getTime() + 3_600_000),
      endsAt: new Date(now.getTime() + 60_000), // endsAt before startsAt
      gate: { type: GqlVoteGateType.Membership },
      powerPolicy: { type: GqlVotePowerPolicyType.Flat },
      options: [
        { label: "Option A", orderIndex: 0 },
        { label: "Option B", orderIndex: 1 },
      ],
    };

    await expect(
      voteUseCase.managerCreateVoteTopic(ctx, {
        input,
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(ValidationError);
  });
});
