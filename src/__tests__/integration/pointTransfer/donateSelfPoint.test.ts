import { GqlTransactionDonateSelfPointInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

class MockTransactionService {
  donateSelfPoint = jest.fn();
}

class MockMembershipService {
  joinIfNeeded = jest.fn();
}

class MockWalletService {
  createMemberWalletIfNeeded = jest.fn();
}

class MockWalletValidator {
  validateTransferMemberToMember = jest.fn();
}

describe("Point Donate Tests", () => {
  const DONATION_POINTS = 100;

  let transactionUseCase: TransactionUseCase;
  let mockTransactionService: MockTransactionService;
  let mockWalletService: MockWalletService;
  let mockMembershipService: MockMembershipService;
  let mockWalletValidator: MockWalletValidator;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();

    // モックインスタンスの作成
    mockTransactionService = new MockTransactionService();
    mockWalletService = new MockWalletService();
    mockMembershipService = new MockMembershipService();
    mockWalletValidator = new MockWalletValidator();

    // TransactionUseCaseをモックサービスで初期化
    const issuer = new PrismaClientIssuer();
    transactionUseCase = new TransactionUseCase(
      issuer,
      mockTransactionService as any,
      mockMembershipService as any,
      mockWalletService as any,
      mockWalletValidator as any,
    );
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

    const ctx = { currentUser: { id: fromUser.id } } as IContext;

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
      fromWalletId: fromWallet.id,
      toUserId: toUser.id,
      transferPoints: DONATION_POINTS,
    };

    await transactionUseCase.userDonateSelfPointToAnother(ctx, input);

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

    const fromWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
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
