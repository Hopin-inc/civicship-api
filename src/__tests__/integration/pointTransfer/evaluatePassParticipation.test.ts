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

    useCase = container.resolve(EvaluationUseCase);

    const opportunityOwnerUserInserted = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    opportunityOwnerUserId = opportunityOwnerUserInserted.id;
    ctx = { currentUser: { id: opportunityOwnerUserId } } as unknown as IContext;

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

  it("creates POINT_REWARD transaction on evaluation", async () => {
    await useCase.managerPassEvaluation(
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

  it("transfers points from opportunityOwner to participation wallet", async () => {
    await useCase.managerPassEvaluation(
      {
        input: { participationId, comment: testSetup.comment },
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

  it("updates currentPointView after evaluation", async () => {
    await useCase.managerPassEvaluation(
      {
        input: { participationId, comment: testSetup.comment },
        permission: { communityId },
      },
      ctx,
    );

    await TestDataSourceHelper.refreshCurrentPoints();

    // ✅ 参加者（ポイントを受け取る側）
    const participationPoint = (
      await TestDataSourceHelper.findMemberWallet(participationUserId, communityId)
    )?.currentPointView?.currentPoint;
    expect(participationPoint).toBe(testSetup.pointsToEarn);

    // ✅ 機会提供者（ポイントを渡す側）
    const opportunityOwnerPoint = (
      await TestDataSourceHelper.findMemberWallet(opportunityOwnerUserId, communityId)
    )?.currentPointView?.currentPoint;
    const expectedOwnerPoint =
      testSetup.communityInitialPoint /* 初期付与 */ - testSetup.pointsToEarn; /* 評価による支出 */
    expect(opportunityOwnerPoint).toBe(expectedOwnerPoint);

    // ✅ コミュニティウォレット（残高確認）
    const communityPoint = (await TestDataSourceHelper.findCommunityWallet(communityId))
      ?.currentPointView?.currentPoint;
    const expectedCommunityPoint =
      testSetup.communityInitialPoint /* 初期値 */ -
      testSetup.communityInitialPoint; /* GRANT で全額 opportunityOwner に移動 */
    expect(communityPoint).toBe(expectedCommunityPoint); // ← 0 を期待するはず
  });
});
