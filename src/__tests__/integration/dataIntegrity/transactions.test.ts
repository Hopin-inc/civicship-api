import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Data Integrity Integration Tests", () => {
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

  it("should maintain point balance consistency across transactions", async () => {
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

    await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      fromPointChange: 1000,
      toPointChange: 1000,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const issuer = container.resolve(PrismaClientIssuer);
    const ctx = {
      currentUser: { id: user.id },
      issuer,
    } as unknown as IContext;

    await transactionUseCase.ownerGrantCommunityPoint(ctx, {
      input: { toUserId: user.id, transferPoints: 500 },
      permission: { communityId: community.id },
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const allTransactions = await TestDataSourceHelper.findAllTransactions();
    const totalIssued = allTransactions
      .filter(t => t.reason === TransactionReason.POINT_ISSUED)
      .reduce((sum, t) => sum + t.toPointChange, 0);
    
    const totalGranted = allTransactions
      .filter(t => t.reason === TransactionReason.GRANT)
      .reduce((sum, t) => sum + t.toPointChange, 0);

    expect(totalIssued).toBe(1000);
    expect(totalGranted).toBe(500);
  });
});
