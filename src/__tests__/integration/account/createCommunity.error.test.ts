import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture } from "@prisma/client";
import CommunityUseCase from "@/application/domain/account/community/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Community UseCase Business Logic Error Tests", () => {
  let useCase: CommunityUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    useCase = container.resolve(CommunityUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should fail to create community without authentication", async () => {
    const ctx = { issuer } as IContext; // Missing currentUser

    await expect(
      useCase.userCreateCommunityAndJoin({
        input: { name: "Test Community", pointName: "test-points" }
      }, ctx)
    ).rejects.toThrow(/must be logged in|authentication/i);
  });

  it("should fail to delete non-existent community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      useCase.ownerDeleteCommunity({
        id: "non-existent-community-id",
        permission: { communityId: "non-existent-community-id" }
      }, ctx)
    ).rejects.toThrow(/not found|community.*not.*found/i);
  });
});
