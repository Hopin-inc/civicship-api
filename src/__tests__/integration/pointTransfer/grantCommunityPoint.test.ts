import "reflect-metadata";
import { GqlTransactionGrantCommunityPointInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Point Grant Tests", () => {
  const GRANT_POINTS = 50;
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

  it("should grant points from community wallet to user", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Recipient",
      slug: "recipient-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-grant",
      pointName: "c-point",
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const memberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      fromPointChange: GRANT_POINTS,
      toPointChange: GRANT_POINTS,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const input: GqlTransactionGrantCommunityPointInput = {
      toUserId: user.id,
      transferPoints: GRANT_POINTS,
    };

    const permission = { communityId: community.id };

    await transactionUseCase.ownerGrantCommunityPoint(ctx, { input, permission });

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.GRANT,
    );

    expect(tx).toBeDefined();
    expect(tx?.to).toBe(memberWallet.id);
    expect(tx?.toPointChange).toBe(GRANT_POINTS);
  });

  it("should fail to grant if community wallet has insufficient balance", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Recipient",
      slug: "recipient-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-grant",
      pointName: "c-point",
    });
    
    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      fromPointChange: 10,
      toPointChange: 10,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const input: GqlTransactionGrantCommunityPointInput = {
      transferPoints: 9999, // More than the 10 points available
      toUserId: user.id,
    };
    const permission = { communityId: community.id };

    await expect(
      transactionUseCase.ownerGrantCommunityPoint(ctx, { input, permission }),
    ).rejects.toThrow(/Insufficient balance/i);

    const txs = await TestDataSourceHelper.findAllTransactions();
    expect(txs).toHaveLength(1); // Only the initial point issuance transaction
  });
});
