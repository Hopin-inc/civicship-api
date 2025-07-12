import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture } from "@prisma/client";
import { GqlTransactionGrantCommunityPointInput } from "@/types/graphql";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Point Grant Error Handling Tests", () => {
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

  it("should fail to grant points to non-existent user", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlTransactionGrantCommunityPointInput = {
      transferPoints: 100,
      toUserId: "non-existent-user-id",
    };

    await expect(
      transactionUseCase.ownerGrantCommunityPoint(ctx, {
        input,
        permission: { communityId: community.id },
      }),
    ).rejects.toThrow(/not found/i);
  });

  it("should fail to grant points from non-existent community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlTransactionGrantCommunityPointInput = {
      transferPoints: 100,
      toUserId: user.id,
    };

    await expect(
      transactionUseCase.ownerGrantCommunityPoint(ctx, {
        input,
        permission: { communityId: "non-existent-community-id" },
      }),
    ).rejects.toThrow(/not found/i);
  });

});
