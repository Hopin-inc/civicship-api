import "reflect-metadata";
import { container } from "tsyringe";
import { IContext } from "@/types/server";
import { CurrentPrefecture, IdentityPlatform, MembershipStatus } from "@prisma/client";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import { registerProductionDependencies } from "@/application/provider";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import TestDataSourceHelper from "../../helper/test-data-source-helper";

describe("IdentityUseCase.userCreateAccount", () => {
  let useCase: IdentityUseCase;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();

    useCase = container.resolve(IdentityUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should create user, join community, and create wallet", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "test-community",
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: "uid-abc",
      platform: IdentityPlatform.LINE,
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: "test-user",
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
      },
    };

    // Act
    const result = await useCase.userCreateAccount(ctx, input);

    // Assert
    expect(result.user).toBeDefined();
    expect(result.user?.name).toBe("Test User");

    const membership = await TestDataSourceHelper.findMembership({
      userId_communityId: {
        userId: result.user!.id,
        communityId: community.id,
      },
    });

    expect(membership?.status).toBe(MembershipStatus.JOINED);

    const wallet = await TestDataSourceHelper.findMemberWallet(result.user!.id, community.id);
    expect(wallet).toBeDefined();
  });
});
