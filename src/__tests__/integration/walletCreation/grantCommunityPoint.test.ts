import "reflect-metadata";
import { GqlTransactionGrantCommunityPointInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";

describe("Transaction GrantCommunityPoint Integration Tests", () => {
  jest.setTimeout(30_000);
  let useCase: TransactionUseCase;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();

    container.reset();
    registerProductionDependencies();

    useCase = container.resolve(TransactionUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should grant community points to a user", async () => {
    //////////////////////////////////////////////////
    // insert seed data
    //////////////////////////////////////////////////
    const name = "John Doe";
    const slug = "user-1-slug";
    const createUserInput = {
      name: name,
      slug: slug,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    };
    const userInserted = await TestDataSourceHelper.createUser(createUserInput);
    const userId = userInserted.id;

    const ctx = {
      uid: userId,
      currentUser: { id: userId },
    } as unknown as IContext;

    const communityName = "community-1";
    const pointName = "community-1-point";

    const createCommunityInput = {
      name: communityName,
      pointName: pointName,
      image: undefined,
      bio: undefined,
      establishedAt: undefined,
      website: undefined,
    };
    const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
    const communityId = communityInserted.id;

    const createWalletInput = {
      type: WalletType.COMMUNITY,
      community: { connect: { id: communityId } },
    };
    const walletInserted = await TestDataSourceHelper.createWallet(createWalletInput);
    const walletId = walletInserted.id;

    const initialPoint = 50;
    const createTransactionInput = {
      to: walletId,
      toPointChange: initialPoint,
      fromPointChange: initialPoint,
      reason: TransactionReason.POINT_ISSUED,
    };
    await TestDataSourceHelper.createTransaction(createTransactionInput);

    await TestDataSourceHelper.refreshCurrentPoints();

    //////////////////////////////////////////////////
    // construct request
    //////////////////////////////////////////////////
    const grantedPoint = 50;
    const input: GqlTransactionGrantCommunityPointInput = {
      fromWalletId: walletId,
      transferPoints: grantedPoint,
      communityId: communityId,
      toUserId: userId,
    };

    //////////////////////////////////////////////////
    // execute
    //////////////////////////////////////////////////
    await useCase.ownerGrantCommunityPoint(ctx, input);

    //////////////////////////////////////////////////
    // assert result
    //////////////////////////////////////////////////
    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transactionActual = transactions.find((t) => t.reason === TransactionReason.GRANT);

    // toMemberWalletが生成されていること
    const toMemberWalletActual = await TestDataSourceHelper.findMemberWallet(userId);
    expect(toMemberWalletActual).toBeDefined();
    // 期待通りのwalletに移動していること
    expect(transactionActual?.to).toEqual(toMemberWalletActual?.id);
  });
});
