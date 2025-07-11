import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";

describe("Transaction IssueCommunityPoint Error Handling Tests", () => {
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

  it("should fail to issue points with invalid community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { currentUser: { id: user.id } } as IContext;

    const input = {
      issuePoints: 100,
      transferPoints: 0, // Required by type definition
    };

    await expect(
      transactionUseCase.ownerIssueCommunityPoint({ input, permission: { communityId: "invalid-community-id" } }, ctx),
    ).rejects.toThrow();
  });

  it("should fail to issue negative points", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const user = await TestDataSourceHelper.createUser({
      name: "Test User", 
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { currentUser: { id: user.id } } as IContext;

    const input = {
      issuePoints: -100,
      transferPoints: 0, // Required by type definition
    };

    await expect(
      transactionUseCase.ownerIssueCommunityPoint({ input, permission: { communityId: community.id } }, ctx),
    ).rejects.toThrow();
  });
});
