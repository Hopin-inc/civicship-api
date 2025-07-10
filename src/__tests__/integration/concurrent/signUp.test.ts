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

describe("Concurrent SignUp Integration Tests", () => {
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
    await container.resolve<PrismaClientIssuer>("PrismaClientIssuer").disconnect();
  });

  it("should handle concurrent user signups with DID issuance successfully", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `concurrent-community-${uniqueId}`,
      pointName: "pt",
    });

    const concurrentUsers = 5;
    mockDIDVCClient.call.mockResolvedValue({ jobId: "concurrent-job-id" });

    const signupPromises = Array.from({ length: concurrentUsers }, (_, i) => {
      const ctx: IContext = {
        uid: `concurrent-uid-${uniqueId}-${i}`,
        platform: IdentityPlatform.PHONE,
        phoneAuthToken: "test-phone-auth-token",
        communityId: community.id,
        issuer: container.resolve("PrismaClientIssuer"),
      } as IContext;

      const input: GqlMutationUserSignUpArgs = {
        input: {
          name: `Concurrent User ${i}`,
          slug: `concurrent-user-${uniqueId}-${i}`,
          currentPrefecture: CurrentPrefecture.KAGAWA,
          communityId: community.id,
          phoneUid: `concurrent-phone-${uniqueId}-${i}`,
        },
      };

      return useCase.userCreateAccount(ctx, input);
    });

    const results = await Promise.all(signupPromises);

    results.forEach((result, index) => {
      expect(result.user).toBeDefined();
      expect(result.user?.name).toBe(`Concurrent User ${index}`);
    });

    for (const [index, result] of results.entries()) {
      const membership = await TestDataSourceHelper.findMembership({
        userId_communityId: {
          userId: result.user!.id,
          communityId: community.id,
        },
      });
      expect(membership?.status).toBe(MembershipStatus.JOINED);

      const wallet = await TestDataSourceHelper.findMemberWallet(result.user!.id, community.id);
      expect(wallet).toBeDefined();

      await TestDataSourceHelper.updateIdentity(`concurrent-phone-${uniqueId}-${index}`, {
        authToken: "test-phone-auth-token",
        refreshToken: "test-phone-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    await TestDataSourceHelper.refreshCurrentPoints();

    for (const result of results) {
      const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(result.user!.id);
      expect(didRequest).toBeDefined();
      expect(didRequest?.status).toBe("PROCESSING");
      expect(didRequest?.jobId).toBe("concurrent-job-id");
    }

    expect(mockDIDVCClient.call).toHaveBeenCalledTimes(concurrentUsers);
  });

  it("should handle concurrent signups with mixed external API responses", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `mixed-concurrent-community-${uniqueId}`,
      pointName: "pt",
    });

    const concurrentUsers = 3;
    
    mockDIDVCClient.call
      .mockResolvedValueOnce({ jobId: "success-job-1" })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ jobId: "success-job-3" });

    const signupPromises = Array.from({ length: concurrentUsers }, (_, i) => {
      const ctx: IContext = {
        uid: `mixed-concurrent-uid-${uniqueId}-${i}`,
        platform: IdentityPlatform.PHONE,
        phoneAuthToken: "test-phone-auth-token",
        communityId: community.id,
        issuer: container.resolve("PrismaClientIssuer"),
      } as IContext;

      const input: GqlMutationUserSignUpArgs = {
        input: {
          name: `Mixed Concurrent User ${i}`,
          slug: `mixed-concurrent-user-${uniqueId}-${i}`,
          currentPrefecture: CurrentPrefecture.KAGAWA,
          communityId: community.id,
          phoneUid: `mixed-concurrent-phone-${uniqueId}-${i}`,
        },
      };

      return useCase.userCreateAccount(ctx, input);
    });

    const results = await Promise.all(signupPromises);

    results.forEach((result, index) => {
      expect(result.user).toBeDefined();
      expect(result.user?.name).toBe(`Mixed Concurrent User ${index}`);
    });

    for (const [index] of results.entries()) {
      await TestDataSourceHelper.updateIdentity(`mixed-concurrent-phone-${uniqueId}-${index}`, {
        authToken: "test-phone-auth-token",
        refreshToken: "test-phone-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const didRequest1 = await TestDataSourceHelper.findDIDIssuanceRequest(results[0].user!.id);
    expect(didRequest1?.status).toBe("PROCESSING");
    expect(didRequest1?.jobId).toBe("success-job-1");

    const didRequest2 = await TestDataSourceHelper.findDIDIssuanceRequest(results[1].user!.id);
    expect(didRequest2?.status).toBe("PENDING");
    expect(didRequest2?.errorMessage).toBe("External API call failed");
    expect(didRequest2?.jobId).toBeNull();

    const didRequest3 = await TestDataSourceHelper.findDIDIssuanceRequest(results[2].user!.id);
    expect(didRequest3?.status).toBe("PROCESSING");
    expect(didRequest3?.jobId).toBe("success-job-3");
  });

  it("should maintain database consistency during concurrent signups with failures", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const community = await TestDataSourceHelper.createCommunity({
      name: `consistency-community-${uniqueId}`,
      pointName: "pt",
    });

    const concurrentUsers = 4;
    mockDIDVCClient.call.mockResolvedValue(null);

    const signupPromises = Array.from({ length: concurrentUsers }, (_, i) => {
      const ctx: IContext = {
        uid: `consistency-uid-${uniqueId}-${i}`,
        platform: IdentityPlatform.PHONE,
        phoneAuthToken: "test-phone-auth-token",
        communityId: community.id,
        issuer: container.resolve("PrismaClientIssuer"),
      } as IContext;

      const input: GqlMutationUserSignUpArgs = {
        input: {
          name: `Consistency User ${i}`,
          slug: `consistency-user-${uniqueId}-${i}`,
          currentPrefecture: CurrentPrefecture.KAGAWA,
          communityId: community.id,
          phoneUid: `consistency-phone-${uniqueId}-${i}`,
        },
      };

      return useCase.userCreateAccount(ctx, input);
    });

    const results = await Promise.all(signupPromises);

    results.forEach((result, index) => {
      expect(result.user).toBeDefined();
      expect(result.user?.name).toBe(`Consistency User ${index}`);
    });

    for (const [index] of results.entries()) {
      await TestDataSourceHelper.updateIdentity(`consistency-phone-${uniqueId}-${index}`, {
        authToken: "test-phone-auth-token",
        refreshToken: "test-phone-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    await TestDataSourceHelper.refreshCurrentPoints();

    const allUsers = await TestDataSourceHelper.findAll();
    expect(allUsers).toHaveLength(concurrentUsers);

    const allDIDRequests = await TestDataSourceHelper.findAllDIDIssuanceRequests();
    expect(allDIDRequests).toHaveLength(concurrentUsers);

    allDIDRequests.forEach(request => {
      expect(request.status).toBe("PENDING");
      expect(request.errorMessage).toBe("External API call failed");
      expect(request.retryCount).toBe(1);
      expect(request.jobId).toBeNull();
    });

    const userIds = results.map(r => r.user!.id);
    const uniqueUserIds = new Set(userIds);
    expect(uniqueUserIds.size).toBe(concurrentUsers);
  });
});
