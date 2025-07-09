import "reflect-metadata";
import { container } from "tsyringe";
import { LoggedInUserInfo } from "@/types/server";
import { IdentityPlatform } from "@prisma/client";

jest.mock("@/infrastructure/libs/firebase", () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";

describe("DIDIssuanceService", () => {
  class MockDIDIssuanceRequestRepository {
    find = jest.fn();
    create = jest.fn();
    update = jest.fn();
    query = jest.fn();
  }

  class MockIdentityRepository {
    find = jest.fn();
    create = jest.fn();
    update = jest.fn();
  }

  class MockDIDVCServerClient {
    call = jest.fn();
  }

  class MockIdentityService {
    fetchNewIdToken = jest.fn();
    storeAuthTokens = jest.fn();
  }

  let mockDIDIssuanceRequestRepository: MockDIDIssuanceRequestRepository;
  let mockIdentityRepository: MockIdentityRepository;
  let mockClient: MockDIDVCServerClient;
  let mockIdentityService: MockIdentityService;
  let service: DIDIssuanceService;

  const mockCtx = { currentUser: { id: "user-1" } };
  const mockUserId = "user-1";
  const mockPhoneUid = "phone-uid-123";
  const mockToken = "valid-token";
  const mockRefreshToken = "refresh-token-123";

  const mockIdentity = {
    uid: mockPhoneUid,
    platform: IdentityPlatform.PHONE,
    userId: mockUserId,
    communityId: "community-1",
    authToken: mockToken,
    refreshToken: mockRefreshToken,
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDIDRequest = {
    id: "did-request-1",
    userId: mockUserId,
    status: "PENDING",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockDIDIssuanceRequestRepository = new MockDIDIssuanceRequestRepository();
    mockIdentityRepository = new MockIdentityRepository();
    mockClient = new MockDIDVCServerClient();
    mockIdentityService = new MockIdentityService();

    container.register("DIDIssuanceRequestRepository", {
      useValue: mockDIDIssuanceRequestRepository,
    });
    container.register("IdentityRepository", { useValue: mockIdentityRepository });
    container.register("DIDVCServerClient", { useValue: mockClient });
    container.register("IdentityService", { useValue: mockIdentityService });

    service = container.resolve(DIDIssuanceService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("requestDIDIssuance - success scenarios", () => {
    beforeEach(() => {
      mockDIDIssuanceRequestRepository.create.mockResolvedValue(mockDIDRequest);
      mockIdentityRepository.find.mockResolvedValue(mockIdentity);
    });

    it("should successfully request DID issuance with valid token", async () => {
      const mockResponse = { jobId: "job-123" };
      mockClient.call.mockResolvedValue(mockResponse);

      const result = await service.requestDIDIssuance(mockUserId, mockPhoneUid, mockCtx as LoggedInUserInfo);

      expect(mockClient.call).toHaveBeenCalledWith(
        mockPhoneUid,
        mockToken,
        "/did/jobs/create-and-publish",
        "POST",
        { userId: mockUserId, requestId: mockDIDRequest.id }
      );
      expect(mockDIDIssuanceRequestRepository.update).toHaveBeenCalledWith(
        mockCtx,
        mockDIDRequest.id,
        {
          status: "PROCESSING",
          jobId: "job-123",
        }
      );
      expect(result).toEqual({
        success: true,
        requestId: mockDIDRequest.id,
        jobId: "job-123",
      });
    });

    it("should refresh token and proceed when token is expired", async () => {
      const expiredIdentity = {
        ...mockIdentity,
        tokenExpiresAt: new Date(Date.now() - 3600000),
      };
      mockIdentityRepository.find.mockResolvedValue(expiredIdentity);

      mockIdentityService.fetchNewIdToken.mockResolvedValue({
        idToken: "new-token",
        refreshToken: "new-refresh-token",
        expiresIn: 3600,
      });

      const mockResponse = { jobId: "job-123" };
      mockClient.call.mockResolvedValue(mockResponse);

      const result = await service.requestDIDIssuance(mockUserId, mockPhoneUid, mockCtx as LoggedInUserInfo);

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockClient.call).toHaveBeenCalledWith(
        mockPhoneUid,
        "new-token",
        "/did/jobs/create-and-publish",
        "POST",
        { userId: mockUserId, requestId: mockDIDRequest.id }
      );
      expect(result.success).toBe(true);
    });
  });

  describe("requestDIDIssuance - external API failure scenarios", () => {
    beforeEach(() => {
      mockDIDIssuanceRequestRepository.create.mockResolvedValue(mockDIDRequest);
      mockIdentityRepository.find.mockResolvedValue(mockIdentity);
    });

    it("should handle external API failure (null response) gracefully", async () => {
      mockClient.call.mockResolvedValue(null);

      const result = await service.requestDIDIssuance(mockUserId, mockPhoneUid, mockCtx as LoggedInUserInfo);

      expect(mockClient.call).toHaveBeenCalledWith(
        mockPhoneUid,
        mockToken,
        "/did/jobs/create-and-publish",
        "POST",
        { userId: mockUserId, requestId: mockDIDRequest.id }
      );
      expect(mockDIDIssuanceRequestRepository.update).toHaveBeenCalledWith(
        mockCtx,
        mockDIDRequest.id,
        {
          errorMessage: "External API call failed",
          retryCount: { increment: 1 },
        }
      );
      expect(result).toEqual({
        success: true,
        requestId: mockDIDRequest.id,
      });
    });

    it("should continue processing when token refresh fails", async () => {
      const expiredIdentity = {
        ...mockIdentity,
        tokenExpiresAt: new Date(Date.now() - 3600000),
      };
      mockIdentityRepository.find.mockResolvedValue(expiredIdentity);
      mockIdentityService.fetchNewIdToken.mockResolvedValue(null);

      const mockResponse = { jobId: "job-123" };
      mockClient.call.mockResolvedValue(mockResponse);

      const result = await service.requestDIDIssuance(mockUserId, mockPhoneUid, mockCtx as LoggedInUserInfo);

      expect(mockClient.call).toHaveBeenCalledWith(
        mockPhoneUid,
        mockToken,
        "/did/jobs/create-and-publish",
        "POST",
        { userId: mockUserId, requestId: mockDIDRequest.id }
      );
      expect(result.success).toBe(true);
    });

    it("should handle both token refresh failure and external API failure", async () => {
      const expiredIdentity = {
        ...mockIdentity,
        tokenExpiresAt: new Date(Date.now() - 3600000),
      };
      mockIdentityRepository.find.mockResolvedValue(expiredIdentity);
      mockIdentityService.fetchNewIdToken.mockResolvedValue(null);
      mockClient.call.mockResolvedValue(null);

      const result = await service.requestDIDIssuance(mockUserId, mockPhoneUid, mockCtx as LoggedInUserInfo);

      expect(mockDIDIssuanceRequestRepository.update).toHaveBeenCalledWith(
        mockCtx,
        mockDIDRequest.id,
        {
          errorMessage: "External API call failed",
          retryCount: { increment: 1 },
        }
      );
      expect(result).toEqual({
        success: true,
        requestId: mockDIDRequest.id,
      });
    });
  });

  describe("refreshAuthToken", () => {
    it("should successfully refresh auth token", async () => {
      mockIdentityService.fetchNewIdToken.mockResolvedValue({
        idToken: "new-token",
        refreshToken: "new-refresh-token",
        expiresIn: 3600,
      });
      mockIdentityService.storeAuthTokens = jest.fn().mockResolvedValue(undefined);

      const result = await service.refreshAuthToken(mockPhoneUid, mockRefreshToken);

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockIdentityService.storeAuthTokens).toHaveBeenCalled();
      expect(result).toEqual({
        authToken: "new-token",
        refreshToken: "new-refresh-token",
        expiryTime: expect.any(Date),
      });
    });

    it("should return null when fetchNewIdToken returns null", async () => {
      mockIdentityService.fetchNewIdToken.mockResolvedValue(null);

      const result = await service.refreshAuthToken(mockPhoneUid, mockRefreshToken);

      expect(result).toBeNull();
    });

    it("should return null when fetchNewIdToken throws error", async () => {
      mockIdentityService.fetchNewIdToken.mockRejectedValue(new Error("Token refresh failed"));

      const result = await service.refreshAuthToken(mockPhoneUid, mockRefreshToken);

      expect(result).toBeNull();
    });
  });

  describe("evaluateTokenValidity", () => {
    it("should return valid token when not expired", () => {
      const validIdentity = {
        ...mockIdentity,
        authToken: "valid-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
      };

      const result = service.evaluateTokenValidity(validIdentity);

      expect(result).toEqual({
        token: "valid-token",
        isValid: true,
      });
    });

    it("should return invalid token when expired", () => {
      const expiredIdentity = {
        ...mockIdentity,
        authToken: "expired-token",
        tokenExpiresAt: new Date(Date.now() - 3600000),
      };

      const result = service.evaluateTokenValidity(expiredIdentity);

      expect(result).toEqual({
        token: "expired-token",
        isValid: false,
      });
    });

    it("should return invalid when tokenExpiresAt is null", () => {
      const identityWithoutExpiry = {
        ...mockIdentity,
        authToken: "token",
        tokenExpiresAt: null,
      };

      const result = service.evaluateTokenValidity(identityWithoutExpiry);

      expect(result).toEqual({
        token: "token",
        isValid: false,
      });
    });
  });
});
