import "reflect-metadata";
import { GqlCheckIsSelfPermissionInput, GqlTransactionDonateSelfPointToCommunityInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("donateSelfPointToCommunity Integration Tests", () => {
  jest.setTimeout(30_000);

  const DONATION_POINTS = 100;
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

  it("should decrease member wallet and increase community wallet", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "community-donate",
      pointName: "c-point",
    });

    const user = await TestDataSourceHelper.createUser({
      name: "Donor User",
      slug: "donor-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const memberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: memberWallet.id } },
      fromPointChange: DONATION_POINTS,
      toPointChange: DONATION_POINTS,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlTransactionDonateSelfPointToCommunityInput = {
      communityId: community.id,
      transferPoints: DONATION_POINTS,
    };
    const permission: GqlCheckIsSelfPermissionInput = { userId: user.id };

    await transactionUseCase.userDonateSelfPointToCommunity(ctx, { input, permission });

    await TestDataSourceHelper.refreshCurrentPoints();

    const memberBalanceAfter = await TestDataSourceHelper.getCurrentPoints(memberWallet.id);
    const communityBalanceAfter = await TestDataSourceHelper.getCurrentPoints(communityWallet.id);

    expect(memberBalanceAfter).toBe(0);
    expect(communityBalanceAfter).toBe(DONATION_POINTS);
  });

  it("should create a transaction with DONATION reason", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "community-donate",
      pointName: "c-point",
    });

    const user = await TestDataSourceHelper.createUser({
      name: "Donor User",
      slug: "donor-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const memberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: memberWallet.id } },
      fromPointChange: DONATION_POINTS,
      toPointChange: DONATION_POINTS,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlTransactionDonateSelfPointToCommunityInput = {
      communityId: community.id,
      transferPoints: DONATION_POINTS,
      comment: "応援しています！",
    };
    const permission: GqlCheckIsSelfPermissionInput = { userId: user.id };

    await transactionUseCase.userDonateSelfPointToCommunity(ctx, { input, permission });

    const allTxs = await TestDataSourceHelper.findAllTransactions();
    const donationTx = allTxs.find((t) => t.reason === TransactionReason.DONATION);

    expect(donationTx).toBeDefined();
    expect(donationTx?.from).toBe(memberWallet.id);
    expect(donationTx?.to).toBe(communityWallet.id);
    expect(donationTx?.fromPointChange).toBe(DONATION_POINTS);
    expect(donationTx?.toPointChange).toBe(DONATION_POINTS);
  });

  it("should throw when member balance is insufficient", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "community-donate",
      pointName: "c-point",
    });

    const user = await TestDataSourceHelper.createUser({
      name: "Donor User",
      slug: "donor-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const memberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });

    await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: memberWallet.id } },
      fromPointChange: 10,
      toPointChange: 10,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlTransactionDonateSelfPointToCommunityInput = {
      communityId: community.id,
      transferPoints: 9999, // exceeds available balance
    };
    const permission: GqlCheckIsSelfPermissionInput = { userId: user.id };

    await expect(
      transactionUseCase.userDonateSelfPointToCommunity(ctx, { input, permission }),
    ).rejects.toThrow(/insufficient.*balance/i);

    const allTxs = await TestDataSourceHelper.findAllTransactions();
    expect(allTxs.filter((t) => t.reason === TransactionReason.DONATION)).toHaveLength(0);
  });
});
