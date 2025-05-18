import "reflect-metadata";
import { GqlTransactionIssueCommunityPointInput } from "@/types/graphql";
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

describe("Point Issue Tests", () => {
  const ISSUE_POINTS = 100;
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

  it("should issue community points", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Issuer",
      slug: "issuer-slug",
      currentPrefecture: CurrentPrefecture.Kagawa,
    });
    const ctx = { currentUser: { id: user.id } } as unknown as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-issue",
      pointName: "c-point",
    });

    const wallet = await TestDataSourceHelper.createWallet({
      type: WalletType.Community,
      community: { connect: { id: community.id } },
    });

    const input: GqlTransactionIssueCommunityPointInput = {
      transferPoints: ISSUE_POINTS,
      toWalletId: wallet.id,
    };

    await transactionUseCase.ownerIssueCommunityPoint(
      { input, permission: { communityId: community.id } },
      ctx,
    );

    await TestDataSourceHelper.refreshCurrentPoints();

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.PointIssued,
    );

    expect(tx).toBeDefined();
    expect(tx?.to).toBe(wallet.id);
    expect(tx?.toPointChange).toBe(ISSUE_POINTS);
  });
});
