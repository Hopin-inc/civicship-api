import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture } from "@prisma/client";
import { IContext } from "@/types/server";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Membership Integration: Accept Invitation Error Handling", () => {
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

  it("should fail to accept invitation for non-existent community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      membershipUseCase.userAcceptMyInvitation(
        { input: { communityId: "non-existent-community-id", userId: user.id }, 
          permission: { userId: user.id } },
        ctx,
      ),
    ).rejects.toThrow(/not found/i);
  });

  it("should fail to accept invitation with invalid user ID", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const ctx = { currentUser: { id: "invalid-user-id" }, issuer } as IContext;

    await expect(
      membershipUseCase.userAcceptMyInvitation(
        { input: { communityId: community.id, userId: "invalid-user-id" }, 
          permission: { userId: "invalid-user-id" } },
        ctx,
      ),
    ).rejects.toThrow(/foreign key constraint|not found/i);
  });

  it("should fail to accept invitation with malformed community ID", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      membershipUseCase.userAcceptMyInvitation(
        { input: { communityId: "malformed-id", userId: user.id }, 
          permission: { userId: user.id } },
        ctx,
      ),
    ).rejects.toThrow(/foreign key constraint|not found/i);
  });
});
