import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Data Integrity and Concurrency E2E Tests", () => {
  let transactionUseCase: TransactionUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    transactionUseCase = container.resolve(TransactionUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should maintain point balance consistency across multiple transactions", async () => {
    const user1 = await TestDataSourceHelper.createUser({
      name: "User 1",
      slug: "user-1",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const user2 = await TestDataSourceHelper.createUser({
      name: "User 2",
      slug: "user-2", 
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const user1Wallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user1.id } },
    });

    const user2Wallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user2.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      toPointChange: 1000,
      fromPointChange: 1000,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx1 = { currentUser: { id: user1.id }, issuer } as IContext;
    const ctx2 = { currentUser: { id: user2.id }, issuer } as IContext;

    await transactionUseCase.ownerGrantCommunityPoint(ctx1, {
      input: { transferPoints: 300, toUserId: user1.id },
      permission: { communityId: community.id },
    });

    await transactionUseCase.ownerGrantCommunityPoint(ctx2, {
      input: { transferPoints: 200, toUserId: user2.id },
      permission: { communityId: community.id },
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const allTransactions = await TestDataSourceHelper.findAllTransactions();
    const totalIssued = allTransactions
      .filter(t => t.reason === TransactionReason.POINT_ISSUED)
      .reduce((sum, t) => sum + Number(t.toPointChange), 0);
    
    const totalGranted = allTransactions
      .filter(t => t.reason === TransactionReason.GRANT)
      .reduce((sum, t) => sum + Number(t.toPointChange), 0);

    expect(totalIssued).toBe(1000);
    expect(totalGranted).toBe(500);

    const user1WalletUpdated = await TestDataSourceHelper.findWallet(user1Wallet.id);
    const user2WalletUpdated = await TestDataSourceHelper.findWallet(user2Wallet.id);
    const communityWalletUpdated = await TestDataSourceHelper.findWallet(communityWallet.id);

    expect(user1WalletUpdated?.currentPointView?.currentPoint).toBe(BigInt(300));
    expect(user2WalletUpdated?.currentPointView?.currentPoint).toBe(BigInt(200));
    expect(communityWalletUpdated?.currentPointView?.currentPoint).toBe(BigInt(500));
  });

  it("should handle complex transaction rollback scenarios", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      toPointChange: 100,
      fromPointChange: 100,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await transactionUseCase.ownerGrantCommunityPoint(ctx, {
      input: { transferPoints: 50, toUserId: user.id },
      permission: { communityId: community.id },
    });

    await expect(
      transactionUseCase.ownerGrantCommunityPoint(ctx, {
        input: { transferPoints: 100, toUserId: user.id },
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(/insufficient/i);

    await TestDataSourceHelper.refreshCurrentPoints();
    
    const userWallet = await TestDataSourceHelper.findMemberWallet(user.id, community.id);
    const communityWalletUpdated = await TestDataSourceHelper.findWallet(communityWallet.id);

    expect(userWallet?.currentPointView?.currentPoint).toBe(BigInt(50));
    expect(communityWalletUpdated?.currentPointView?.currentPoint).toBe(BigInt(50));

    const transactions = await TestDataSourceHelper.findAllTransactions();
    expect(transactions).toHaveLength(2); // Issue + successful grant only
  });

  it("should maintain data integrity across complex multi-step workflows", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const users: any[] = [];
    for (let i = 0; i < 5; i++) {
      const user = await TestDataSourceHelper.createUser({
        name: `User ${i + 1}`,
        slug: `user-${i + 1}-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      users.push(user);
    }

    const community = await TestDataSourceHelper.createCommunity({
      name: `Integrity Test Community ${uniqueId}`,
      pointName: "integrity-pts",
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const userWallets: any[] = [];
    for (const user of users) {
      const wallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: user.id } },
      });
      userWallets.push(wallet);
    }

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      toPointChange: 10000,
      fromPointChange: 10000,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    for (let i = 0; i < users.length; i++) {
      const ctx = { currentUser: { id: users[i].id }, issuer } as IContext;
      await transactionUseCase.ownerGrantCommunityPoint(ctx, {
        input: { transferPoints: 1000, toUserId: users[i].id },
        permission: { communityId: community.id },
      });
    }

    for (let i = 0; i < users.length - 1; i++) {
      const ctx = { currentUser: { id: users[i].id }, issuer } as IContext;
      await transactionUseCase.userDonateSelfPointToAnother(ctx, {
        input: {
          communityId: community.id,
          toUserId: users[i + 1].id,
          transferPoints: 200,
        },
        permission: { userId: users[i].id },
      });
    }

    await TestDataSourceHelper.refreshCurrentPoints();

    const finalWallets: any[] = [];
    for (const wallet of userWallets) {
      const updated = await TestDataSourceHelper.findWallet(wallet.id);
      finalWallets.push(updated);
    }

    expect(finalWallets[0]?.currentPointView?.currentPoint).toBe(BigInt(800)); // 1000 - 200
    expect(finalWallets[1]?.currentPointView?.currentPoint).toBe(BigInt(1000)); // 1000 + 200 - 200
    expect(finalWallets[2]?.currentPointView?.currentPoint).toBe(BigInt(1000)); // 1000 + 200 - 200
    expect(finalWallets[3]?.currentPointView?.currentPoint).toBe(BigInt(1000)); // 1000 + 200 - 200
    expect(finalWallets[4]?.currentPointView?.currentPoint).toBe(BigInt(1200)); // 1000 + 200

    const totalUserPoints = finalWallets.reduce((sum, wallet) => 
      sum + Number(wallet?.currentPointView?.currentPoint || 0), 0);
    
    const communityWalletFinal = await TestDataSourceHelper.findWallet(communityWallet.id);
    const totalCommunityPoints = Number(communityWalletFinal?.currentPointView?.currentPoint || 0);

    expect(totalUserPoints + totalCommunityPoints).toBe(10000);
  });
});
