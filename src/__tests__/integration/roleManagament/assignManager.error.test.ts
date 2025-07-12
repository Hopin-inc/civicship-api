import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture } from "@prisma/client";
import { IContext } from "@/types/server";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Membership Integration: Assign Manager Error Handling", () => {
  let membershipUseCase: MembershipUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    issuer = container.resolve(PrismaClientIssuer);
    membershipUseCase = container.resolve(MembershipUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should fail to assign manager to non-existent user", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const ctx = { currentUser: { id: "valid-user-id" }, issuer } as IContext;

    await expect(
      membershipUseCase.managerAssignManager(
        { input: { userId: "non-existent-user-id", communityId: community.id }, 
          permission: { communityId: community.id } },
        ctx,
      ),
    ).rejects.toThrow(/not found/i);
  });

  it("should fail to assign manager in non-existent community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      membershipUseCase.managerAssignManager(
        { input: { userId: user.id, communityId: "non-existent-community-id" }, 
          permission: { communityId: "non-existent-community-id" } },
        ctx,
      ),
    ).rejects.toThrow(/not found/i);
  });

  it("should fail when trying to assign manager role to user without membership", async () => {
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
      membershipUseCase.managerAssignManager(
        { input: { userId: user.id, communityId: community.id }, 
          permission: { communityId: community.id } },
        ctx,
      ),
    ).rejects.toThrow(/not found|membership.*not.*found/i);
  });
});
