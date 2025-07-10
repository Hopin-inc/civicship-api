import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { requestDIDVC } from "@/presentation/batch/requestDIDVC";
import { CurrentPrefecture, IdentityPlatform } from "@prisma/client";

describe("requestDIDVC Batch Processing Integration Tests", () => {
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

  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
    await container.resolve<PrismaClientIssuer>("PrismaClientIssuer").disconnect();
  });

  it("should create DID requests for users without existing requests", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `batch-community-${uniqueId}`,
      pointName: "pt",
    });

    const users = await Promise.all([
      TestDataSourceHelper.createUser({
        name: `Batch User 1`,
        slug: `batch-user-1-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
      TestDataSourceHelper.createUser({
        name: `Batch User 2`,
        slug: `batch-user-2-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
    ]);

    for (const user of users) {
      await TestDataSourceHelper.createIdentity({
        uid: `phone-${user.id}-${uniqueId}`,
        platform: IdentityPlatform.PHONE,
        authToken: "test-auth-token",
        refreshToken: "test-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
      });
    }

    mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" });

    const result = await requestDIDVC();

    expect(result).toContain("DID requests sent:");
    expect(result).toContain("success: 2");
    expect(result).toContain("failure: 0");

    for (const user of users) {
      const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(user.id);
      expect(didRequest).toBeDefined();
      expect(didRequest?.status).toBe("PROCESSING");
      expect(didRequest?.jobId).toBe("test-job-id");
    }
  });

  it("should handle external API failures gracefully during batch DID request creation", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `batch-fail-community-${uniqueId}`,
      pointName: "pt",
    });

    const users = await Promise.all([
      TestDataSourceHelper.createUser({
        name: `Batch Fail User 1`,
        slug: `batch-fail-user-1-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
      TestDataSourceHelper.createUser({
        name: `Batch Fail User 2`,
        slug: `batch-fail-user-2-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
    ]);

    for (const user of users) {
      await TestDataSourceHelper.createIdentity({
        uid: `phone-fail-${user.id}-${uniqueId}`,
        platform: IdentityPlatform.PHONE,
        authToken: "test-auth-token",
        refreshToken: "test-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
      });
    }

    mockDIDVCClient.call.mockResolvedValue(null);

    const result = await requestDIDVC();

    expect(result).toContain("DID requests sent:");
    expect(result).toContain("success: 0");
    expect(result).toContain("failure: 2");

    for (const user of users) {
      const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(user.id);
      expect(didRequest).toBeDefined();
      expect(didRequest?.status).toBe("PENDING");
      expect(didRequest?.errorMessage).toBe("External API call failed");
      expect(didRequest?.retryCount).toBe(1);
      expect(didRequest?.jobId).toBeNull();
    }
  });

  it("should handle partial failures in batch processing", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `batch-partial-community-${uniqueId}`,
      pointName: "pt",
    });

    const users = await Promise.all([
      TestDataSourceHelper.createUser({
        name: `Batch Partial User 1`,
        slug: `batch-partial-user-1-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
      TestDataSourceHelper.createUser({
        name: `Batch Partial User 2`,
        slug: `batch-partial-user-2-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
      TestDataSourceHelper.createUser({
        name: `Batch Partial User 3`,
        slug: `batch-partial-user-3-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
    ]);

    for (const user of users) {
      await TestDataSourceHelper.createIdentity({
        uid: `phone-partial-${user.id}-${uniqueId}`,
        platform: IdentityPlatform.PHONE,
        authToken: "test-auth-token",
        refreshToken: "test-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
      });
    }

    mockDIDVCClient.call
      .mockResolvedValueOnce({ jobId: "test-job-id-1" })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ jobId: "test-job-id-3" });

    const result = await requestDIDVC();

    expect(result).toContain("DID requests sent:");
    expect(result).toContain("success: 2");
    expect(result).toContain("failure: 1");

    const didRequest1 = await TestDataSourceHelper.findDIDIssuanceRequest(users[0].id);
    expect(didRequest1?.status).toBe("PROCESSING");
    expect(didRequest1?.jobId).toBe("test-job-id-1");

    const didRequest2 = await TestDataSourceHelper.findDIDIssuanceRequest(users[1].id);
    expect(didRequest2?.status).toBe("PENDING");
    expect(didRequest2?.errorMessage).toBe("External API call failed");
    expect(didRequest2?.jobId).toBeNull();

    const didRequest3 = await TestDataSourceHelper.findDIDIssuanceRequest(users[2].id);
    expect(didRequest3?.status).toBe("PROCESSING");
    expect(didRequest3?.jobId).toBe("test-job-id-3");
  });

  it("should skip users who already have DID requests", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `batch-skip-community-${uniqueId}`,
      pointName: "pt",
    });

    const user = await TestDataSourceHelper.createUser({
      name: `Batch Skip User`,
      slug: `batch-skip-user-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    await TestDataSourceHelper.createIdentity({
      uid: `phone-skip-${user.id}-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      authToken: "test-auth-token",
      refreshToken: "test-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000),
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createDIDIssuanceRequest({
      user: { connect: { id: user.id } },
      status: "PROCESSING",
      jobId: "existing-job-id",
    });

    mockDIDVCClient.call.mockResolvedValue({ jobId: "new-job-id" });

    const result = await requestDIDVC();

    expect(result).toContain("DID requests sent:");
    expect(result).toContain("success: 0");
    expect(result).toContain("failure: 0");

    const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(user.id);
    expect(didRequest?.jobId).toBe("existing-job-id");
    expect(mockDIDVCClient.call).not.toHaveBeenCalled();
  });
});
