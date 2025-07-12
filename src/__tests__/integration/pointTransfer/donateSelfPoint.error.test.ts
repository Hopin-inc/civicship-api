import "reflect-metadata";
import { GqlTransactionDonateSelfPointInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Point Donation Error Handling Tests", () => {
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

  it("should fail to donate points to non-existent user", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const userWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: userWallet.id } },
      toPointChange: 100,
      fromPointChange: 100,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      toUserId: "non-existent-user-id",
      transferPoints: 50,
    };

    await expect(
      transactionUseCase.userDonateSelfPointToAnother(ctx, {
        input,
        permission: { userId: user.id },
      }),
    ).rejects.toThrow(/not found/i);
  });

  it("should fail to donate points in non-existent community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: "non-existent-community-id",
      toUserId: user.id,
      transferPoints: 50,
    };

    await expect(
      transactionUseCase.userDonateSelfPointToAnother(ctx, {
        input,
        permission: { userId: user.id },
      }),
    ).rejects.toThrow(/not found/i);
  });

  it("should fail to donate points with insufficient balance", async () => {
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

    const user1Wallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user1.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: user1Wallet.id } },
      toPointChange: 30,
      fromPointChange: 30,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: user1.id }, issuer } as IContext;

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      toUserId: user2.id,
      transferPoints: 50, // More than available balance
    };

    await expect(
      transactionUseCase.userDonateSelfPointToAnother(ctx, {
        input,
        permission: { userId: user1.id },
      }),
    ).rejects.toThrow(/insufficient.*balance/i);
  });
});
