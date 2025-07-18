import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import {
  CurrentPrefecture,
  MembershipStatus,
  MembershipStatusReason,
  OpportunityCategory,
  ParticipationStatus,
  ParticipationStatusReason,
  PublishStatus,
  Role,
  TransactionReason,
  WalletType,
} from "@prisma/client";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";
import { GqlEvaluationStatus } from "@/types/graphql";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Point Reward Tests", () => {
  const testSetup = {
    userName: "Jane Doe",
    slug: "user-2-slug",
    communityName: "community-2",
    pointName: "community-2-point",
    pointsToEarn: 100,
    communityInitialPoint: 101,
    comment: "テスト評価",
  };

  let ctx: IContext;
  let issuer: PrismaClientIssuer;
  let useCase: EvaluationUseCase;
  let opportunityOwnerUserId: string;
  let communityId: string;
  let communityWalletId: string;
  let participationWalletId: string;
  let participationId: string;
  let opportunityOwnerWalletId: string;
  let participationUserId: string;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();

    container.reset();
    registerProductionDependencies();

    issuer = container.resolve(PrismaClientIssuer);
    useCase = container.resolve(EvaluationUseCase);

    const opportunityOwnerUserInserted = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    opportunityOwnerUserId = opportunityOwnerUserInserted.id;
    ctx = {
      currentUser: { id: opportunityOwnerUserId },
      issuer,
    } as unknown as IContext;

    const participationUserInserted = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    participationUserId = participationUserInserted.id;

    const communityInserted = await TestDataSourceHelper.createCommunity({
      name: testSetup.communityName,
      pointName: testSetup.pointName,
      image: undefined,
      bio: undefined,
      establishedAt: undefined,
      website: undefined,
    });
    communityId = communityInserted.id;

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: opportunityOwnerUserId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.JOINED,
      role: Role.MANAGER,
      reason: MembershipStatusReason.ASSIGNED,
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: communityId } },
    });
    communityWalletId = communityWallet.id;

    const participationWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: participationUserId } },
    });
    participationWalletId = participationWallet.id;

    const opportunityOwnerWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: opportunityOwnerUserId } },
    });
    opportunityOwnerWalletId = opportunityOwnerWallet.id;

    const opportunity = await TestDataSourceHelper.createOpportunity({
      category: OpportunityCategory.QUEST,
      description: "opportunity",
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: true,
      title: "opportunity",
      pointsToEarn: testSetup.pointsToEarn,
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: opportunityOwnerUserId } },
    });

    const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
      opportunity: { connect: { id: opportunity.id } },
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const reservation = await TestDataSourceHelper.createReservation({
      opportunitySlot: { connect: { id: opportunitySlot.id } },
      createdByUser: { connect: { id: opportunityOwnerUserId } },
    });

    const participation = await TestDataSourceHelper.createParticipation({
      status: ParticipationStatus.PENDING,
      reason: ParticipationStatusReason.RESERVATION_APPLIED,
      community: { connect: { id: communityId } },
      user: { connect: { id: participationUserId } },
      reservation: { connect: { id: reservation.id } },
    });
    participationId = participation.id;

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWalletId } },
      toPointChange: testSetup.communityInitialPoint,
      fromPointChange: testSetup.communityInitialPoint,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.createTransaction({
      fromWallet: { connect: { id: communityWalletId } },
      toWallet: { connect: { id: opportunityOwnerWalletId } },
      toPointChange: testSetup.communityInitialPoint,
      fromPointChange: testSetup.communityInitialPoint,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("creates POINT_REWARD transaction on bulk evaluation", async () => {
    await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: {
          communityId,
        },
      },
      ctx,
    );

    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transaction = transactions.find((t) => t.reason === TransactionReason.POINT_REWARD);
    expect(transaction).toBeDefined();
  });

  it("transfers points from opportunityOwner to participation wallet on bulk evaluation", async () => {
    await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: { communityId },
      },
      ctx,
    );

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.POINT_REWARD,
    );

    expect(tx?.from).toEqual(opportunityOwnerWalletId);
    expect(tx?.to).toEqual(participationWalletId);
    expect(tx?.fromPointChange).toEqual(testSetup.pointsToEarn);
    expect(tx?.toPointChange).toEqual(testSetup.pointsToEarn);
  });

  it("updates currentPointView after bulk evaluation", async () => {
    await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: { communityId },
      },
      ctx,
    );

    await TestDataSourceHelper.refreshCurrentPoints();

    const participationPoint = (
      await TestDataSourceHelper.findMemberWallet(participationUserId, communityId)
    )?.currentPointView?.currentPoint;
    expect(participationPoint).toBe(BigInt(testSetup.pointsToEarn));

    const opportunityOwnerPoint = (
      await TestDataSourceHelper.findMemberWallet(opportunityOwnerUserId, communityId)
    )?.currentPointView?.currentPoint;
    const expectedOwnerPoint = testSetup.communityInitialPoint - testSetup.pointsToEarn;
    expect(opportunityOwnerPoint).toBe(BigInt(expectedOwnerPoint));

    const communityPoint = (await TestDataSourceHelper.findCommunityWallet(communityId))
      ?.currentPointView?.currentPoint;
    const expectedCommunityPoint = 0;
    expect(communityPoint).toBe(BigInt(expectedCommunityPoint));
  });
});
