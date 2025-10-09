import "reflect-metadata";
import { container } from "tsyringe";
import { IContext } from "@/types/server";
import {
  GqlCurrentPrefecture,
  GqlIdentityPlatform,
  GqlMutationUserSignUpArgs,
} from "@/types/graphql";
import { registerProductionDependencies } from "@/application/provider";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("IdentityUseCase.userCreateAccount", () => {
  let useCase: IdentityUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();

    registerProductionDependencies();

    issuer = container.resolve(PrismaClientIssuer);
    useCase = container.resolve(IdentityUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should create user, join community, and create wallet", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `test-community-${uniqueId}`,
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: `uid-${uniqueId}`,
      platform: GqlIdentityPlatform.Line,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer,
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: `test-user-${uniqueId}`,
        currentPrefecture: GqlCurrentPrefecture.Kagawa,
        phoneUid: `test-phone-uid-${uniqueId}`,
        phoneAccessToken: "test-phone-access-token",
      },
    };

    const result = await useCase.userCreateAccount(ctx, input);

    expect(result.user).toBeDefined();
    expect(result.user?.name).toBe("Test User");

    const membership = await TestDataSourceHelper.findMembership({
      userId_communityId: {
        userId: result.user!.id,
        communityId: community.id,
      },
    });

    expect(membership?.status).toBe("JOINED");

    const wallet = await TestDataSourceHelper.findMemberWallet(result.user!.id, community.id);
    expect(wallet).toBeDefined();
  });
});
