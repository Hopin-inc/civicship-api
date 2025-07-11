import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";

describe("Transaction DonateSelfPoint Error Handling Tests", () => {
  let transactionUseCase: TransactionUseCase;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    transactionUseCase = container.resolve(TransactionUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should handle zero point donation", async () => {
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

    const fromMemberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: fromUser.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: fromMemberWallet.id } },
      toPointChange: 100,
      fromPointChange: 100,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: fromUser.id } } as IContext;

    const input = {
      communityId: community.id,
      fromWalletId: fromMemberWallet.id,
      toUserId: toUser.id,
      transferPoints: 0,
    };

    await expect(
      transactionUseCase.userDonateSelfPointToAnother(ctx, { 
        input,
        permission: { userId: fromUser.id }
      }),
    ).rejects.toThrow();
  });

  it("should fail when donating more points than available", async () => {
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

    const fromMemberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: fromUser.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: fromMemberWallet.id } },
      toPointChange: 100,
      fromPointChange: 100,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: fromUser.id } } as IContext;

    const input = {
      communityId: community.id,
      fromWalletId: fromMemberWallet.id,
      toUserId: toUser.id,
      transferPoints: 200, // More than available
    };

    await expect(
      transactionUseCase.userDonateSelfPointToAnother(ctx, { 
        input,
        permission: { userId: fromUser.id }
      }),
    ).rejects.toThrow();
  });
});
