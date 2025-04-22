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
import evaluationResolver from "@/application/domain/evaluation/controller/resolver";

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
  let userId: string;
  let communityId: string;
  let communityWalletId: string;
  let memberWalletId: string;
  let participationId: string;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();

    const userInserted = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    userId = userInserted.id;
    ctx = { currentUser: { id: userId } } as unknown as IContext;

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
      user: { connect: { id: userId } },
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

    const memberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: userId } },
    });
    memberWalletId = memberWallet.id;

    const opportunity = await TestDataSourceHelper.createOpportunity({
      category: OpportunityCategory.QUEST,
      description: "opportunity",
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: true,
      title: "opportunity",
      pointsToEarn: testSetup.pointsToEarn,
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: userId } },
    });

    const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
      opportunity: { connect: { id: opportunity.id } },
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const reservation = await TestDataSourceHelper.createReservation({
      opportunitySlot: { connect: { id: opportunitySlot.id } },
      createdByUser: { connect: { id: userId } },
    });

    const participation = await TestDataSourceHelper.createParticipation({
      status: ParticipationStatus.PENDING,
      reason: ParticipationStatusReason.RESERVATION_APPLIED,
      community: { connect: { id: communityId } },
      user: { connect: { id: userId } },
      reservation: { connect: { id: reservation.id } },
    });
    participationId = participation.id;

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWalletId } },
      toPointChange: testSetup.communityInitialPoint,
      fromPointChange: testSetup.communityInitialPoint,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("creates POINT_REWARD transaction on evaluation", async () => {
    await evaluationResolver.Mutation.evaluationPass(
      {},
      {
        input: {
          participationId,
          comment: testSetup.comment,
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

  it("transfers points from community to member wallet", async () => {
    await evaluationResolver.Mutation.evaluationPass(
      {},
      {
        input: { participationId, comment: testSetup.comment },
        permission: { communityId },
      },
      ctx,
    );

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.POINT_REWARD,
    );

    expect(tx?.from).toEqual(communityWalletId);
    expect(tx?.to).toEqual(memberWalletId);
    expect(tx?.fromPointChange).toEqual(testSetup.pointsToEarn);
    expect(tx?.toPointChange).toEqual(testSetup.pointsToEarn);
  });

  it("updates currentPointView after evaluation", async () => {
    await evaluationResolver.Mutation.evaluationPass(
      {},
      {
        input: { participationId, comment: testSetup.comment },
        permission: { communityId },
      },
      ctx,
    );

    await TestDataSourceHelper.refreshCurrentPoints();

    const memberPoint = (await TestDataSourceHelper.findMemberWallet(userId))?.currentPointView
      ?.currentPoint;
    expect(memberPoint).toBe(testSetup.pointsToEarn);

    const communityPoint = (await TestDataSourceHelper.findCommunityWallet(communityId))
      ?.currentPointView?.currentPoint;
    const expected = testSetup.communityInitialPoint - testSetup.pointsToEarn;
    expect(communityPoint).toBe(expected);
  });
});
