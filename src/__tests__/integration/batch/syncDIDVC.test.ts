import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { syncDIDVC } from "@/presentation/batch/syncDIDVC";
import { CurrentPrefecture, IdentityPlatform, DidIssuanceStatus, VcIssuanceStatus } from "@prisma/client";

describe("syncDIDVC Batch Processing Integration Tests", () => {
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

  it("should sync DID requests successfully when external API returns completed status", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `sync-community-${uniqueId}`,
      pointName: "pt",
    });

    const user = await TestDataSourceHelper.createUser({
      name: `Sync User`,
      slug: `sync-user-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    await TestDataSourceHelper.createIdentity({
      uid: `phone-sync-${user.id}-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      authToken: "test-auth-token",
      refreshToken: "test-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000),
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createDIDIssuanceRequest({
      user: { connect: { id: user.id } },
      status: DidIssuanceStatus.PROCESSING,
      jobId: "test-job-id",
    });

    mockDIDVCClient.call.mockResolvedValue({
      status: "completed",
      result: { didId: "did:test:123" }
    });

    const result = await syncDIDVC();

    expect(result).toContain("DID sync results:");
    expect(result).toContain("success: 1");
    expect(result).toContain("failure: 0");

    const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(user.id);
    expect(didRequest?.status).toBe(DidIssuanceStatus.COMPLETED);
    expect(didRequest?.didValue).toBe("did:test:123");
    expect(didRequest?.completedAt).toBeDefined();
  });

  it("should handle external API failures gracefully during DID sync", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `sync-fail-community-${uniqueId}`,
      pointName: "pt",
    });

    const user = await TestDataSourceHelper.createUser({
      name: `Sync Fail User`,
      slug: `sync-fail-user-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    await TestDataSourceHelper.createIdentity({
      uid: `phone-sync-fail-${user.id}-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      authToken: "test-auth-token",
      refreshToken: "test-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000),
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createDIDIssuanceRequest({
      user: { connect: { id: user.id } },
      status: DidIssuanceStatus.PROCESSING,
      jobId: "test-job-id",
      retryCount: 0,
    });

    mockDIDVCClient.call.mockResolvedValue(null);

    const result = await syncDIDVC();

    expect(result).toContain("DID sync results:");
    expect(result).toContain("skipped: 1");

    const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(user.id);
    expect(didRequest?.status).toBe(DidIssuanceStatus.PROCESSING);
    expect(didRequest?.errorMessage).toBe("External API call failed during sync");
    expect(didRequest?.retryCount).toBe(1);
    expect(didRequest?.didValue).toBeNull();
  });

  it("should handle VC sync with external API failures", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `vc-sync-community-${uniqueId}`,
      pointName: "pt",
    });

    const user = await TestDataSourceHelper.createUser({
      name: `VC Sync User`,
      slug: `vc-sync-user-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    await TestDataSourceHelper.createIdentity({
      uid: `phone-vc-sync-${user.id}-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      authToken: "test-auth-token",
      refreshToken: "test-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000),
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
    });

    const participation = await TestDataSourceHelper.createParticipation({
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
    });

    const evaluation = await TestDataSourceHelper.createTempEvaluation(participation.id, user.id);

    await TestDataSourceHelper.createVCIssuanceRequest({
      user: { connect: { id: user.id } },
      evaluation: { connect: { id: evaluation.id } },
      status: VcIssuanceStatus.PROCESSING,
      jobId: "vc-test-job-id",
    });

    mockDIDVCClient.call.mockResolvedValue(null);

    const result = await syncDIDVC();

    expect(result).toContain("VC sync results:");
    expect(result).toContain("skipped: 1");

    const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(evaluation.id);
    expect(vcRequest?.status).toBe(VcIssuanceStatus.PROCESSING);
    expect(vcRequest?.errorMessage).toBe("External API call failed during sync");
    expect(vcRequest?.retryCount).toBe(1);
    expect(vcRequest?.vcRecordId).toBeNull();

    await TestDataSourceHelper.deleteTempEvaluation(evaluation.id);
  });

  it("should handle mixed success and failure scenarios in batch sync", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `mixed-sync-community-${uniqueId}`,
      pointName: "pt",
    });

    const users = await Promise.all([
      TestDataSourceHelper.createUser({
        name: `Mixed User 1`,
        slug: `mixed-user-1-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
      TestDataSourceHelper.createUser({
        name: `Mixed User 2`,
        slug: `mixed-user-2-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      }),
    ]);

    for (const [index, user] of users.entries()) {
      await TestDataSourceHelper.createIdentity({
        uid: `phone-mixed-${user.id}-${uniqueId}`,
        platform: IdentityPlatform.PHONE,
        authToken: "test-auth-token",
        refreshToken: "test-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
      });

      await TestDataSourceHelper.createDIDIssuanceRequest({
        user: { connect: { id: user.id } },
        status: DidIssuanceStatus.PROCESSING,
        jobId: `mixed-job-id-${index}`,
        retryCount: 0,
      });
    }

    mockDIDVCClient.call
      .mockResolvedValueOnce({
        status: "completed",
        result: { didId: "did:test:success" }
      })
      .mockResolvedValueOnce(null);

    const result = await syncDIDVC();

    expect(result).toContain("DID sync results:");
    expect(result).toContain("success: 1");
    expect(result).toContain("skipped: 1");

    const didRequest1 = await TestDataSourceHelper.findDIDIssuanceRequest(users[0].id);
    expect(didRequest1?.status).toBe(DidIssuanceStatus.COMPLETED);
    expect(didRequest1?.didValue).toBe("did:test:success");

    const didRequest2 = await TestDataSourceHelper.findDIDIssuanceRequest(users[1].id);
    expect(didRequest2?.status).toBe(DidIssuanceStatus.PROCESSING);
    expect(didRequest2?.errorMessage).toBe("External API call failed during sync");
    expect(didRequest2?.retryCount).toBe(1);
  });

  it("should mark requests as failed after retry limit is exceeded", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const community = await TestDataSourceHelper.createCommunity({
      name: `retry-limit-community-${uniqueId}`,
      pointName: "pt",
    });

    const user = await TestDataSourceHelper.createUser({
      name: `Retry Limit User`,
      slug: `retry-limit-user-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    await TestDataSourceHelper.createIdentity({
      uid: `phone-retry-${user.id}-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      authToken: "test-auth-token",
      refreshToken: "test-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000),
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
    });

    await TestDataSourceHelper.createDIDIssuanceRequest({
      user: { connect: { id: user.id } },
      status: DidIssuanceStatus.PROCESSING,
      jobId: "retry-job-id",
      retryCount: 3,
    });

    const result = await syncDIDVC();

    expect(result).toContain("DID sync results:");

    const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(user.id);
    expect(didRequest?.status).toBe(DidIssuanceStatus.FAILED);
    expect(didRequest?.errorMessage).toBe("Exceeded retry limit");
  });
});
