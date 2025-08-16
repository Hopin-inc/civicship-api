import "reflect-metadata";
import { GqlCheckIsSelfPermissionInput, GqlTransactionDonateSelfPointInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Point Donate Tests", () => {
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

  it("should donate points when balance is sufficient", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "community-donate",
      pointName: "c-point",
    });

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

    const ctx = { currentUser: { id: fromUser.id }, issuer } as IContext;

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

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: fromWallet.id } },
      fromPointChange: DONATION_POINTS,
      toPointChange: DONATION_POINTS,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      toUserId: toUser.id,
      transferPoints: DONATION_POINTS,
    };

    const permission: GqlCheckIsSelfPermissionInput = {
      userId: ctx.currentUser?.id ?? "",
    };
    const args = { input, permission };

    await transactionUseCase.userDonateSelfPointToAnother(ctx, args);

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.DONATION,
    );

    expect(tx).toBeDefined();
    expect(tx?.from).toBe(fromWallet.id);
    expect(tx?.to).toBe(toWallet.id);
    expect(tx?.fromPointChange).toBe(DONATION_POINTS);
    expect(tx?.toPointChange).toBe(DONATION_POINTS);
  });

  it("should fail to donate if balance is insufficient", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "community-donate",
      pointName: "c-point",
    });

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

    const ctx = { currentUser: { id: fromUser.id }, issuer } as IContext;

    const fromWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: fromUser.id } },
    });

    await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: toUser.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: fromWallet.id } },
      fromPointChange: 10,
      toPointChange: 10,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      toUserId: toUser.id,
      transferPoints: 9999, // More than the 10 points available
    };

    const permission: GqlCheckIsSelfPermissionInput = {
      userId: ctx.currentUser?.id ?? "",
    };
    const args = { input, permission };

    await expect(transactionUseCase.userDonateSelfPointToAnother(ctx, args)).rejects.toThrow(
      /Insufficient balance/i,
    );

    const txs = await TestDataSourceHelper.findAllTransactions();
    expect(txs).toHaveLength(1); // Only the initial grant transaction
  });

  it("should fail to donate if the recipient is not a community member", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "community-donate",
      pointName: "c-point",
    });

    const fromUser = await TestDataSourceHelper.createUser({
      name: "From User",
      slug: "from-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const toUser = await TestDataSourceHelper.createUser({
      name: "To User (Non-Member)",
      slug: "to-user-non-member",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: fromUser.id }, issuer } as IContext;

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: fromUser.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      role: Role.MEMBER,
      reason: MembershipStatusReason.INVITED,
    });

    const fromWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: fromUser.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: fromWallet.id } },
      fromPointChange: DONATION_POINTS,
      toPointChange: DONATION_POINTS,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      toUserId: toUser.id, // toUser is not a member
      transferPoints: DONATION_POINTS,
    };

    const permission: GqlCheckIsSelfPermissionInput = {
      userId: ctx.currentUser?.id ?? "",
    };
    const args = { input, permission };

    await expect(transactionUseCase.userDonateSelfPointToAnother(ctx, args)).rejects.toThrow(
      /Member wallet/i,
    );

    const txs = await TestDataSourceHelper.findAllTransactions();
    expect(txs).toHaveLength(1); // Only the initial grant transaction
  });
});
