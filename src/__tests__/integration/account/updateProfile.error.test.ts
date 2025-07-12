import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture } from "@prisma/client";
import UserUseCase from "@/application/domain/account/user/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("User UseCase Business Logic Error Tests", () => {
  let useCase: UserUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    useCase = container.resolve(UserUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });


  it("should fail to update profile without authentication", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { 
      currentUser: { id: user.id },
      issuer 
    } as IContext;

    await expect(
      useCase.userUpdateProfile(ctx, {
        input: {
          name: "Updated Name",
          slug: "valid-slug",
          currentPrefecture: CurrentPrefecture.KAGAWA,
        },
        permission: { userId: user.id }
      })
    ).rejects.toThrow(/authentication.*required|uid.*missing/i);
  });

  it("should fail to update profile with duplicate slug", async () => {
    await TestDataSourceHelper.createUser({
      name: "User 1",
      slug: "existing-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const user2 = await TestDataSourceHelper.createUser({
      name: "User 2",
      slug: "user-2-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { 
      currentUser: { id: user2.id }, 
      uid: "test-uid",
      issuer 
    } as IContext;

    await expect(
      useCase.userUpdateProfile(ctx, {
        input: {
          name: "User 2 Updated",
          slug: "existing-slug",
          currentPrefecture: CurrentPrefecture.KAGAWA,
        },
        permission: { userId: user2.id }
      })
    ).rejects.toThrow(/unique.*constraint|duplicate.*slug/i);
  });
});
