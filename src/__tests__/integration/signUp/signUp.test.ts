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
import waitForExpect from "wait-for-expect";

describe("IdentityUseCase.userCreateAccount", () => {
  let useCase: IdentityUseCase;
  let mockDIDVCClient: jest.Mocked<DIDVCServerClient>;
  let mockDIDIssuanceService: { requestDIDIssuance: jest.Mock };

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();

    mockDIDVCClient = { call: jest.fn() } as any;

    mockDIDIssuanceService = {
      requestDIDIssuance: jest.fn().mockImplementation(async (...args) => {
        await mockDIDVCClient.call(
          "issuer-id",
          "issuer-secret",
          "/did/jobs/create-and-publish",
          "POST",
          { userId: args[0] },
        );
      }),
    };

    // 1. 本番依存関係の登録
    registerProductionDependencies();

    // 2. モックで上書き（!!）
    container.register("PrismaClientIssuer", {
      useValue: new PrismaClientIssuer(),
    });
    container.register("DIDVCServerClient", { useValue: mockDIDVCClient });
    container.register("DIDIssuanceService", { useValue: mockDIDIssuanceService });

    // 3. useCase の解決
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
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
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
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: "test-user",
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
        phoneUid: "test-phone-uid",
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
      }),
    );

    await waitForExpect(() => {
      expect(mockDIDIssuanceService.requestDIDIssuance).toHaveBeenCalledWith(
        result.user!.id,
        "test-phone-uid",
        expect.any(Object),
      );
    });
  });

  it("should create user successfully when DID external API times out", async () => {
    const community = await TestDataSourceHelper.createCommunity({
      name: "test-community",
      pointName: "pt",
    });

    const ctx: IContext = {
      uid: "uid-abc",
      platform: IdentityPlatform.PHONE,
      phoneAuthToken: "test-phone-auth-token",
      communityId: community.id,
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "Test User",
        slug: "test-user",
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
        phoneUid: "test-phone-uid",
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

    await waitForExpect(() => {
      expect(mockDIDIssuanceService.requestDIDIssuance).toHaveBeenCalledWith(
        result.user!.id,
        "test-phone-uid",
        expect.any(Object),
      );
    });
  });
});
