import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture } from "@prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";

describe("Authorization Integration Tests", () => {
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

  it("should reject operations without authentication", async () => {
    const ctx = {} as IContext; // No currentUser

    const input = {
      issuePoints: 100,
      transferPoints: 0, // Required by type definition
    };

    await expect(
      transactionUseCase.ownerIssueCommunityPoint({ input, permission: { communityId: "test-id" } }, ctx),
    ).rejects.toThrow(/User must be logged in/i);
  });

  it("should reject operations with insufficient permissions", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Regular User",
      slug: "regular-user", 
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const ctx = { currentUser: { id: user.id } } as IContext;

    const input = {
      issuePoints: 100,
      transferPoints: 0, // Required by type definition
    };

    await expect(
      transactionUseCase.ownerIssueCommunityPoint({ input, permission: { communityId: community.id } }, ctx),
    ).rejects.toThrow(/Insufficient permissions/i);
  });
});
