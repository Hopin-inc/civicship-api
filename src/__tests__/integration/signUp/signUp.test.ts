import "reflect-metadata";
import { container } from "tsyringe";
import { IContext } from "@/types/server";
import { CurrentPrefecture, IdentityPlatform, MembershipStatus } from "@prisma/client";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import { registerProductionDependencies } from "@/application/provider";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
// import waitForExpect from "wait-for-expect";

describe("IdentityUseCase.userCreateAccount", () => {
  let useCase: IdentityUseCase;
  let mockDIDVCClient: jest.Mocked<DIDVCServerClient>;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();

    mockDIDVCClient = { call: jest.fn() } as any;

    // 1. 本番依存関係の登録（実際のサービスを使用）
    registerProductionDependencies();

    container.register("PrismaClientIssuer", {
      useValue: new PrismaClientIssuer(),
    });
    container.register("DIDVCServerClient", { useValue: mockDIDVCClient });
    

    // 3. useCase の解決
    useCase = container.resolve(IdentityUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
    await container.resolve<PrismaClientIssuer>("PrismaClientIssuer").disconnect();
  });

  it("should create user, join community, and create wallet", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `test-community-${uniqueId}`,
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: `uid-${uniqueId}`,
      platform: IdentityPlatform.LINE,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: `test-user-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
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

    expect(membership?.status).toBe(MembershipStatus.JOINED);

    const wallet = await TestDataSourceHelper.findMemberWallet(result.user!.id, community.id);
    expect(wallet).toBeDefined();
  });

  it("should create user successfully even when DID external API fails", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `test-community-api-fail-${uniqueId}`,
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: `uid-api-fail-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: `test-user-api-fail-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
        phoneUid: `test-phone-uid-api-fail-${uniqueId}`,
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

    await TestDataSourceHelper.updateIdentity(`test-phone-uid-api-fail-${uniqueId}`, {
      authToken: "test-phone-auth-token",
      refreshToken: "test-phone-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(mockDIDVCClient.call).toHaveBeenCalledWith(
      `test-phone-uid-api-fail-${uniqueId}`,
      "test-phone-auth-token",
      "/did/jobs/create-and-publish",
      "POST",
      expect.objectContaining({
        userId: result.user!.id,
      }),
    );

    const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(result.user!.id);
    expect(didRequest).toBeDefined();
    expect(didRequest?.status).toBe("PENDING");
    expect(didRequest?.errorMessage).toBe("External API call failed");
    expect(didRequest?.retryCount).toBe(1);
    expect(didRequest?.jobId).toBeNull();
  });

  it("should create user successfully when DID external API times out", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `test-community-timeout-${uniqueId}`,
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: `uid-timeout-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: `test-user-timeout-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
        phoneUid: `test-phone-uid-timeout-${uniqueId}`,
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

    await TestDataSourceHelper.updateIdentity(`test-phone-uid-timeout-${uniqueId}`, {
      authToken: "test-phone-auth-token",
      refreshToken: "test-phone-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(result.user!.id);
    expect(didRequest).toBeDefined();
    expect(didRequest?.status).toBe("PENDING");
    expect(didRequest?.errorMessage).toBe("External API call failed");
    expect(didRequest?.retryCount).toBe(1);
    expect(didRequest?.jobId).toBeNull();
  });

  it("should handle Firebase token refresh failure gracefully", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `test-community-token-refresh-${uniqueId}`,
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: `uid-token-refresh-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: `test-user-token-refresh-fail-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
        phoneUid: `test-phone-uid-token-refresh-${uniqueId}`,
      },
    };

    mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" });

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

    await TestDataSourceHelper.updateIdentity(`test-phone-uid-token-refresh-${uniqueId}`, {
      authToken: "test-phone-auth-token",
      refreshToken: "test-phone-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(mockDIDVCClient.call).toHaveBeenCalledWith(
      `test-phone-uid-token-refresh-${uniqueId}`,
      "test-phone-auth-token",
      "/did/jobs/create-and-publish",
      "POST",
      expect.objectContaining({
        userId: result.user!.id,
      })
    );

    const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(result.user!.id);
    expect(didRequest).toBeDefined();
    expect(didRequest?.status).toBe("PROCESSING");
    expect(didRequest?.jobId).toBe("test-job-id");
  });

  it("should handle multiple external API failures simultaneously", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `test-community-multi-fail-${uniqueId}`,
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: `uid-multi-fail-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: `test-user-multi-fail-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
        phoneUid: `test-phone-uid-multi-fail-${uniqueId}`,
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

    await TestDataSourceHelper.updateIdentity(`test-phone-uid-multi-fail-${uniqueId}`, {
      authToken: "test-phone-auth-token",
      refreshToken: "test-phone-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(mockDIDVCClient.call).toHaveBeenCalledWith(
      `test-phone-uid-multi-fail-${uniqueId}`,
      "test-phone-auth-token",
      "/did/jobs/create-and-publish",
      "POST",
      expect.objectContaining({
        userId: result.user!.id,
      })
    );

    const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(result.user!.id);
    expect(didRequest).toBeDefined();
    expect(didRequest?.status).toBe("PENDING");
    expect(didRequest?.errorMessage).toBe("External API call failed");
    expect(didRequest?.retryCount).toBe(1);
    expect(didRequest?.jobId).toBeNull();
  });
});
