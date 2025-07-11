import "reflect-metadata";
import { GqlTransactionIssueCommunityPointInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Point Issue Tests", () => {
  const ISSUE_POINTS = 100;
  let transactionUseCase: TransactionUseCase;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();

    container.reset();
    registerProductionDependencies();

    container.register("PrismaClientIssuer", {
      useValue: new PrismaClientIssuer(),
    });

    transactionUseCase = container.resolve(TransactionUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should issue community points", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Issuer",
      slug: "issuer-slug",
      currentPrefecture: "KAGAWA" as any,
    });
    const ctx: IContext = {
      currentUser: { id: user.id },
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-issue",
      pointName: "c-point",
    });

    const wallet = await TestDataSourceHelper.createWallet({
      type: "COMMUNITY" as any,
      community: { connect: { id: community.id } },
    });

    const input: GqlTransactionIssueCommunityPointInput = {
      transferPoints: ISSUE_POINTS,
    };

    await transactionUseCase.ownerIssueCommunityPoint(
      { input, permission: { communityId: community.id } },
      ctx,
    );

    await TestDataSourceHelper.refreshCurrentPoints();

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === "POINT_ISSUED",
    );

    expect(tx).toBeDefined();
    expect(tx?.to).toBe(wallet.id);
    expect(tx?.toPointChange).toBe(ISSUE_POINTS);
  });
});
