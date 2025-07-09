import "reflect-metadata";
import { container } from "tsyringe";
import { IContext } from "@/types/server";
import { CurrentPrefecture, IdentityPlatform, MembershipStatus } from "@prisma/client";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import { registerProductionDependencies } from "@/application/provider";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import TestDataSourceHelper from "../../helper/test-data-source-helper";

describe("IdentityUseCase.userCreateAccount", () => {
  let useCase: IdentityUseCase;
  let mockDIDVCClient: jest.Mocked<DIDVCServerClient>;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();

    mockDIDVCClient = {
      call: jest.fn(),
    } as any;

    container.register("DIDVCServerClient", { useValue: mockDIDVCClient });
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

    expect(membership?.status).toBe(MembershipStatus.JOINED);

    const wallet = await TestDataSourceHelper.findMemberWallet(result.user!.id, community.id);
    expect(wallet).toBeDefined();
  });

  it("should create user successfully even when DID external API fails", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "test-community",
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: "uid-abc",
      platform: IdentityPlatform.PHONE,
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: "test-user",
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
      },
    };

    mockDIDVCClient.call.mockResolvedValue(null);

    // Act
    const result = await useCase.userCreateAccount(ctx, input);

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

    expect(mockDIDVCClient.call).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      "/did/jobs/create-and-publish",
      "POST",
      expect.objectContaining({
        userId: result.user!.id,
      })
    );
  });

  it("should create user successfully when DID external API times out", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "test-community",
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: "uid-abc",
      platform: IdentityPlatform.PHONE,
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: "test-user",
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
      },
    };

    mockDIDVCClient.call.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(null), 100);
      });
    });

    // Act
    const result = await useCase.userCreateAccount(ctx, input);

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
