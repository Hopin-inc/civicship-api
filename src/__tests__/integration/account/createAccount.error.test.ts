import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture } from "@prisma/client";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlCurrentPrefecture, GqlIdentityPlatform } from "@/types/graphql";

describe("Identity UseCase Business Logic Error Tests", () => {
  let useCase: IdentityUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    useCase = container.resolve(IdentityUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should fail to create account without authentication context", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const ctx: IContext = {
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer,
    } as IContext;

    await expect(
      useCase.userCreateAccount(ctx, {
        input: {
          name: "Test User",
          slug: "test-slug",
          currentPrefecture: GqlCurrentPrefecture.Kagawa,
          communityId: community.id,
          phoneUid: "test-phone-uid",
        },
      })
    ).rejects.toThrow(/authentication|uid.*required/i);
  });

  it("should fail to create account with duplicate slug", async () => {
    await TestDataSourceHelper.createUser({
      name: "Existing User",
      slug: "existing-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const ctx: IContext = {
      uid: "test-uid",
      platform: GqlIdentityPlatform.Line,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer,
    } as IContext;

    await expect(
      useCase.userCreateAccount(ctx, {
        input: {
          name: "New User",
          slug: "existing-slug",
          currentPrefecture: GqlCurrentPrefecture.Kagawa,
          communityId: community.id,
          phoneUid: "test-phone-uid",
        },
      })
    ).rejects.toThrow(/unique.*constraint|duplicate.*slug/i);
  });

  it("should fail to create account with non-existent community", async () => {
    const ctx: IContext = {
      uid: "test-uid",
      platform: GqlIdentityPlatform.Line,
      phoneAuthToken: "test-phone-auth-token",
      communityId: "non-existent-community-id",
      issuer,
    } as IContext;

    await expect(
      useCase.userCreateAccount(ctx, {
        input: {
          name: "Test User",
          slug: "test-slug",
          currentPrefecture: GqlCurrentPrefecture.Kagawa,
          communityId: "non-existent-community-id",
          phoneUid: "test-phone-uid",
        },
      })
    ).rejects.toThrow(/not found|community.*not.*found/i);
  });
});
