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

  beforeEach(async () => {
    // テストデータの初期化
    await TestDataSourceHelper.deleteAll();
  });

  afterAll(async () => {
    // データベース接続の解放
    await TestDataSourceHelper.disconnect();
  });

  it("should give reward successfully", async () => {
    //
    // 👤 ユーザー作成
    //
    const userInserted = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const userId = userInserted.id;
    const ctx = { currentUser: { id: userId } } as unknown as IContext;

    //
    // 🏘️ コミュニティ作成 & メンバーシップ登録
    //
    const communityInserted = await TestDataSourceHelper.createCommunity({
      name: testSetup.communityName,
      pointName: testSetup.pointName,
      image: undefined,
      bio: undefined,
      establishedAt: undefined,
      website: undefined,
    });
    const communityId = communityInserted.id;

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: userId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.JOINED,
      role: Role.MANAGER,
      reason: MembershipStatusReason.ASSIGNED,
    });

    //
    // 💰 ウォレット作成（コミュニティ / メンバー）
    //
    const communityWalletInserted = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: communityId } },
    });
    const communityWalletId = communityWalletInserted.id;

    const memberWalletInserted = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: userId } },
    });
    const memberWalletId = memberWalletInserted.id;

    //
    // 🎯 機会・スロット・予約・参加情報の作成
    //
    const opportunityInserted = await TestDataSourceHelper.createOpportunity({
      category: OpportunityCategory.QUEST,
      description: "opportunity",
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: true,
      title: "opportunity",
      pointsToEarn: testSetup.pointsToEarn,
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: userId } },
    });
    const opportunityId = opportunityInserted.id;

    const opportunitySlotInserted = await TestDataSourceHelper.createOpportunitySlot({
      opportunity: { connect: { id: opportunityId } },
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    const opportunitySlotId = opportunitySlotInserted.id;

    const reservationInserted = await TestDataSourceHelper.createReservation({
      opportunitySlot: { connect: { id: opportunitySlotId } },
      createdByUser: { connect: { id: userId } },
    });
    const reservationId = reservationInserted.id;

    const participationInserted = await TestDataSourceHelper.createParticipation({
      status: ParticipationStatus.PENDING,
      reason: ParticipationStatusReason.RESERVATION_APPLIED,
      community: { connect: { id: communityId } },
      user: { connect: { id: userId } },
      reservation: { connect: { id: reservationId } },
    });
    const participationId = participationInserted.id;

    //
    // 🔄 初期ポイント注入 & リフレッシュ
    //
    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWalletId } },
      toPointChange: testSetup.communityInitialPoint,
      fromPointChange: testSetup.communityInitialPoint,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    //
    // ✅ 評価処理の実行
    //
    await evaluationResolver.Mutation.evaluationPass(
      {},
      {
        input: {
          participationId: participationId,
          comment: testSetup.comment,
        },
        permission: {
          communityId: communityId,
        },
      },
      ctx,
    );

    await TestDataSourceHelper.refreshCurrentPoints();

    //
    // ✅ 検証
    //
    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transactionActual = transactions.find((t) => t.reason === TransactionReason.POINT_REWARD);

    const allTransactions = await TestDataSourceHelper.findAllTransactions();

    console.log(
      "🚨 All Transactions:",
      allTransactions.map((t) => ({
        id: t.id,
        reason: t.reason,
        from: t.from,
        to: t.to,
        fromPointChange: t.fromPointChange,
        toPointChange: t.toPointChange,
      })),
    );

    expect(transactionActual).toBeDefined();
    expect(transactionActual?.from).toEqual(communityWalletId);
    expect(transactionActual?.to).toEqual(memberWalletId);
    expect(transactionActual?.fromPointChange).toEqual(testSetup.pointsToEarn);
    expect(transactionActual?.toPointChange).toEqual(testSetup.pointsToEarn);

    const memberCurrentPointActual = (await TestDataSourceHelper.findMemberWallet(userId))
      ?.currentPointView?.currentPoint;
    expect(memberCurrentPointActual).toEqual(testSetup.pointsToEarn);

    const communityCurrentPointActual = (
      await TestDataSourceHelper.findCommunityWallet(communityId)
    )?.currentPointView?.currentPoint;
    const expectedCommunityPoint = testSetup.communityInitialPoint - testSetup.pointsToEarn;
    expect(communityCurrentPointActual).toEqual(expectedCommunityPoint);
  });
});
