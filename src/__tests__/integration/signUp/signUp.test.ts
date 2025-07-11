import "reflect-metadata";
import { container } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import { registerProductionDependencies } from "@/application/provider";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("IdentityUseCase.userCreateAccount", () => {
  let useCase: IdentityUseCase;
  let mockDIDVCClient: jest.Mocked<DIDVCServerClient>;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();

    mockDIDVCClient = { call: jest.fn() } as any;

    registerProductionDependencies();

    container.register("PrismaClientIssuer", {
      useValue: new PrismaClientIssuer(),
    });
    container.register("DIDVCServerClient", { useValue: mockDIDVCClient });

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
      platform: "LINE" as any,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: `test-user-${uniqueId}`,
        currentPrefecture: "KAGAWA" as any,
        communityId: community.id,
        phoneUid: `test-phone-uid-${uniqueId}`,
      },
    };

    mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" });

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

    expect(membership?.status).toBe("JOINED");

    const wallet = await TestDataSourceHelper.findMemberWallet(result.user!.id, community.id);
    expect(wallet).toBeDefined();
  });

});
