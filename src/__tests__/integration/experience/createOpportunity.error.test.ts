import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, OpportunityCategory, PublishStatus } from "@prisma/client";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Opportunity UseCase Business Logic Error Tests", () => {
  let useCase: OpportunityUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    useCase = container.resolve(OpportunityUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should fail to create opportunity with empty title", async () => {
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

    await expect(
      useCase.managerCreateOpportunity({
        input: {
          title: "",
          description: "Test description",
          category: OpportunityCategory.EVENT,
          publishStatus: PublishStatus.PUBLIC,
          requireApproval: false,
        },
        permission: { communityId: community.id }
      }, ctx)
    ).rejects.toThrow(/title.*required|empty.*title/i);
  });

  it("should fail to delete non-existent opportunity", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      useCase.managerDeleteOpportunity({
        id: "non-existent-opportunity-id",
        permission: { communityId: "some-community-id" }
      }, ctx)
    ).rejects.toThrow(/not found|opportunity.*not.*found/i);
  });
});
