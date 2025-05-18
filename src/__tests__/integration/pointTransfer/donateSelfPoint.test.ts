import "reflect-metadata";
import { GqlTransactionDonateSelfPointInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { 
  GqlCurrentPrefecture as CurrentPrefecture, 
  GqlTransactionReason as TransactionReason, 
  GqlWalletType as WalletType 
} from "@/types/graphql";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";

describe("Point Donate Tests", () => {
  const DONATION_POINTS = 100;
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

  it("should donate points when balance is sufficient", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "community-donate",
      pointName: "c-point",
    });

    const fromUser = await TestDataSourceHelper.createUser({
      name: "From User",
      slug: "from-user",
      currentPrefecture: CurrentPrefecture.Kagawa,
    });

    const toUser = await TestDataSourceHelper.createUser({
      name: "To User",
      slug: "to-user",
      currentPrefecture: CurrentPrefecture.Kagawa,
    });

    const ctx = { currentUser: { id: fromUser.id } } as IContext;

    const fromWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.Member,
      community: { connect: { id: community.id } },
      user: { connect: { id: fromUser.id } },
    });

    const toWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.Member,
      community: { connect: { id: community.id } },
      user: { connect: { id: toUser.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: fromWallet.id } },
      fromPointChange: DONATION_POINTS,
      toPointChange: DONATION_POINTS,
      reason: TransactionReason.Grant,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      fromWalletId: fromWallet.id,
      toUserId: toUser.id,
      transferPoints: DONATION_POINTS,
    };

    await transactionUseCase.userDonateSelfPointToAnother(ctx, input);

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.Donation,
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
      currentPrefecture: CurrentPrefecture.Kagawa,
    });

    const toUser = await TestDataSourceHelper.createUser({
      name: "To User",
      slug: "to-user",
      currentPrefecture: CurrentPrefecture.Kagawa,
    });

    const fromWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.Member,
      community: { connect: { id: community.id } },
      user: { connect: { id: fromUser.id } },
    });

    const ctx = { currentUser: { id: fromUser.id } } as IContext;

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      fromWalletId: fromWallet.id,
      toUserId: toUser.id,
      transferPoints: 9999, // 残高不足
    };

    await expect(transactionUseCase.userDonateSelfPointToAnother(ctx, input)).rejects.toThrow(
      /Insufficient balance/i,
    );

    const txs = await TestDataSourceHelper.findAllTransactions();
    expect(txs).toHaveLength(0);
  });
});
