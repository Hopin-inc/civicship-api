import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture } from "@prisma/client";
import { GqlCurrentPrefecture, GqlIdentityPlatform } from "@/types/graphql";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Identity SignUp Error Handling Tests", () => {
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

  it("should fail to create account with empty name", async () => {
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
          name: "",
          slug: "test-user",
          currentPrefecture: GqlCurrentPrefecture.Kagawa,
          communityId: community.id,
          phoneUid: "test-phone-uid",
        },
      })
    ).rejects.toThrow(/name.*required|empty.*name/i);
  });

  it("should fail to create account with empty slug", async () => {
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
          name: "Test User",
          slug: "",
          currentPrefecture: GqlCurrentPrefecture.Kagawa,
          communityId: community.id,
          phoneUid: "test-phone-uid",
        },
      })
    ).rejects.toThrow(/slug.*required|empty.*slug/i);
  });

  it("should fail to create account with duplicate slug", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    await TestDataSourceHelper.createUser({
      name: "Existing User",
      slug: "duplicate-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
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
          slug: "duplicate-slug",
          currentPrefecture: GqlCurrentPrefecture.Kagawa,
          communityId: community.id,
          phoneUid: "test-phone-uid",
        },
      })
    ).rejects.toThrow(/already.*exists|duplicate.*slug/i);
  });

  it("should fail to create account for non-existent community", async () => {
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
          slug: "test-user",
          currentPrefecture: GqlCurrentPrefecture.Kagawa,
          communityId: "non-existent-community-id",
          phoneUid: "test-phone-uid",
        },
      })
    ).rejects.toThrow(/community.*not.*found/i);
  });

  it("should fail when missing phone auth token", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const ctx: IContext = {
      uid: "test-uid",
      platform: GqlIdentityPlatform.Line,
      communityId: community.id,
      issuer,
    } as IContext; // Missing phoneAuthToken

    await expect(
      useCase.userCreateAccount(ctx, {
        input: {
          name: "Test User",
          slug: "test-user",
          currentPrefecture: GqlCurrentPrefecture.Kagawa,
          communityId: community.id,
          phoneUid: "test-phone-uid",
        },
      })
    ).rejects.toThrow(/phone.*auth.*token|authentication.*required/i);
  });
});
