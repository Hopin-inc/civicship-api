import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Point Transfer Boundary Value Tests", () => {
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

  it("should handle large point amounts within database limits", async () => {
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

    const maxInt4 = 2147483647;
    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      toPointChange: maxInt4,
      fromPointChange: maxInt4,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input = {
      transferPoints: 1000000, // Large but valid amount
      toUserId: user.id,
    };

    const result = await transactionUseCase.ownerGrantCommunityPoint(ctx, {
      input,
      permission: { communityId: community.id },
    });

    expect(result).toBeDefined();
  });

  it("should handle large point values correctly within database constraints", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const largeAmount = 1000000000; // 1 billion, within INT4 range
    
    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      toPointChange: largeAmount,
      fromPointChange: largeAmount,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const wallet = await TestDataSourceHelper.findWallet(communityWallet.id);
    expect(wallet?.currentPointView?.currentPoint).toBe(BigInt(largeAmount));
  });

  it("should handle maximum INT4 boundary value correctly", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const maxInt4 = 2147483647;
    
    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      toPointChange: maxInt4,
      fromPointChange: maxInt4,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const wallet = await TestDataSourceHelper.findWallet(communityWallet.id);
    expect(wallet?.currentPointView?.currentPoint).toBe(BigInt(maxInt4));
  });

  it("should handle BigInt arithmetic correctly in point transfers", async () => {
    const fromUser = await TestDataSourceHelper.createUser({
      name: "From User",
      slug: "from-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const toUser = await TestDataSourceHelper.createUser({
      name: "To User",
      slug: "to-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const fromWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: fromUser.id } },
    });

    const toWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: toUser.id } },
    });

    const safeInitialAmount = 1000000000; // 1 billion, within INT4 range
    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: fromWallet.id } },
      toPointChange: safeInitialAmount,
      fromPointChange: safeInitialAmount,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: fromUser.id }, issuer } as IContext;

    const transferAmount = 1000000;
    await transactionUseCase.userDonateSelfPointToAnother(ctx, {
      input: {
        communityId: community.id,
        toUserId: toUser.id,
        transferPoints: transferAmount,
      },
      permission: { userId: fromUser.id },
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const fromWalletUpdated = await TestDataSourceHelper.findWallet(fromWallet.id);
    const toWalletUpdated = await TestDataSourceHelper.findWallet(toWallet.id);

    expect(fromWalletUpdated?.currentPointView?.currentPoint).toBe(BigInt(safeInitialAmount) - BigInt(transferAmount));
    expect(toWalletUpdated?.currentPointView?.currentPoint).toBe(BigInt(transferAmount));
  });

  it("should handle BigInt overflow scenarios", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const maxSafeInt = Number.MAX_SAFE_INTEGER;
    
    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      toPointChange: maxSafeInt,
      fromPointChange: maxSafeInt,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const wallet = await TestDataSourceHelper.findWallet(communityWallet.id);
    expect(wallet?.currentPointView?.currentPoint).toBe(BigInt(maxSafeInt));

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      toPointChange: 1,
      fromPointChange: 1,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const updatedWallet = await TestDataSourceHelper.findWallet(communityWallet.id);
    expect(updatedWallet?.currentPointView?.currentPoint).toBe(BigInt(maxSafeInt) + BigInt(1));
  });
});
