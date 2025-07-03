import { container } from "tsyringe";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";
import { IContext } from "@/types/server";
import { IDIDIssuanceRequestRepository } from "@/application/domain/account/identity/didIssuanceRequest/data/interface";

enum MockDidIssuanceStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

interface MockIdentity {
  id: string;
  uid: string;
  authToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
}

class MockDIDIssuanceRequestRepository implements Partial<IDIDIssuanceRequestRepository> {
  create = jest.fn();
  update = jest.fn();
  findById = jest.fn();
  findLatestCompletedByUserId = jest.fn();
  findPending = jest.fn();
  findExceededRetries = jest.fn();
  updateMany = jest.fn();
}

class MockIdentityService {
  fetchNewIdToken = jest.fn();
  storeAuthTokens = jest.fn();
  createUserAndIdentity = jest.fn();
  addIdentityToUser = jest.fn();
  linkPhoneIdentity = jest.fn();
  findUserByIdentity = jest.fn();
}

class MockIdentityRepository {
  find = jest.fn();
  findByUserId = jest.fn();
  create = jest.fn();
  update = jest.fn();
}

class MockDIDVCServerClient {
  call = jest.fn();
}

describe("DIDIssuanceService", () => {
  let service: DIDIssuanceService;
  let mockDidIssuanceRequestRepository: MockDIDIssuanceRequestRepository;
  let mockIdentityService: MockIdentityService;
  let mockIdentityRepository: MockIdentityRepository;
  let mockDIDVCServerClient: MockDIDVCServerClient;
  let mockCtx: IContext;

  const TEST_USER_ID = "user-123";
  const TEST_PHONE_UID = "phone-uid-123";
  const TEST_REQUEST_ID = "request-123";
  const TEST_JOB_ID = "job-456";
  const TEST_TOKEN = "auth-token-789";
  const TEST_REFRESH_TOKEN = "refresh-token-abc";

  beforeEach(() => {
    mockDidIssuanceRequestRepository = new MockDIDIssuanceRequestRepository();
    mockIdentityService = new MockIdentityService();
    mockIdentityRepository = new MockIdentityRepository();
    mockDIDVCServerClient = new MockDIDVCServerClient();

    container.registerInstance("DIDIssuanceRequestRepository", mockDidIssuanceRequestRepository);
    container.registerInstance("IdentityService", mockIdentityService);
    container.registerInstance("IdentityRepository", mockIdentityRepository);
    container.registerInstance("DIDVCServerClient", mockDIDVCServerClient);

    service = container.resolve(DIDIssuanceService);

    mockCtx = {
      uid: TEST_USER_ID,
      communityId: "community-123",
      currentUser: { id: TEST_USER_ID },
    } as IContext;

    jest.clearAllMocks();
  });

  afterEach(() => {
    container.clearInstances();
    jest.restoreAllMocks();
  });

  describe("requestDIDIssuance", () => {
    const mockIdentity: MockIdentity = {
      id: "identity-123",
      uid: TEST_PHONE_UID,
      authToken: TEST_TOKEN,
      refreshToken: TEST_REFRESH_TOKEN,
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    };

    const mockDidRequest = {
      id: TEST_REQUEST_ID,
      userId: TEST_USER_ID,
      status: MockDidIssuanceStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should successfully request DID issuance with valid token", async () => {
      mockIdentityRepository.find.mockResolvedValue(mockIdentity);
      mockDidIssuanceRequestRepository.create.mockResolvedValue(mockDidRequest);
      mockDIDVCServerClient.call.mockResolvedValue({ jobId: TEST_JOB_ID });
      mockDidIssuanceRequestRepository.update.mockResolvedValue({
        ...mockDidRequest,
        status: MockDidIssuanceStatus.PROCESSING,
        jobId: TEST_JOB_ID,
      });

      const result = await service.requestDIDIssuance(TEST_USER_ID, TEST_PHONE_UID, mockCtx);

      expect(mockIdentityRepository.find).toHaveBeenCalledWith(TEST_PHONE_UID);
      expect(mockDidIssuanceRequestRepository.create).toHaveBeenCalledWith(mockCtx, {
        userId: TEST_USER_ID,
        status: MockDidIssuanceStatus.PENDING,
      });
      expect(mockDIDVCServerClient.call).toHaveBeenCalledWith(
        TEST_PHONE_UID,
        TEST_TOKEN,
        "/did/jobs/create-and-publish",
        "POST",
        { userId: TEST_USER_ID, requestId: TEST_REQUEST_ID }
      );
      expect(mockDidIssuanceRequestRepository.update).toHaveBeenCalledWith(mockCtx, TEST_REQUEST_ID, {
        status: MockDidIssuanceStatus.PROCESSING,
        jobId: TEST_JOB_ID,
      });
      expect(result).toEqual({
        success: true,
        requestId: TEST_REQUEST_ID,
        jobId: TEST_JOB_ID,
      });
    });

    it("should successfully request DID issuance without job ID", async () => {
      mockIdentityRepository.find.mockResolvedValue(mockIdentity);
      mockDidIssuanceRequestRepository.create.mockResolvedValue(mockDidRequest);
      mockDIDVCServerClient.call.mockResolvedValue({});

      const result = await service.requestDIDIssuance(TEST_USER_ID, TEST_PHONE_UID, mockCtx);

      expect(mockDIDVCServerClient.call).toHaveBeenCalled();
      expect(mockDidIssuanceRequestRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        requestId: TEST_REQUEST_ID,
      });
    });

    it("should throw error when identity is not found", async () => {
      mockIdentityRepository.find.mockResolvedValue(null);

      await expect(service.requestDIDIssuance(TEST_USER_ID, TEST_PHONE_UID, mockCtx)).rejects.toThrow(
        "No identity found for DID issuance"
      );

      expect(mockIdentityRepository.find).toHaveBeenCalledWith(TEST_PHONE_UID);
      expect(mockDidIssuanceRequestRepository.create).not.toHaveBeenCalled();
    });

    it("should refresh token when current token is expired", async () => {
      const expiredIdentity = {
        ...mockIdentity,
        tokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };
      const refreshedTokenData = {
        authToken: "new-auth-token",
        refreshToken: "new-refresh-token",
        expiryTime: new Date(Date.now() + 3600000),
      };

      mockIdentityRepository.find.mockResolvedValue(expiredIdentity);
      mockDidIssuanceRequestRepository.create.mockResolvedValue(mockDidRequest);
      mockIdentityService.fetchNewIdToken.mockResolvedValue({
        idToken: refreshedTokenData.authToken,
        refreshToken: refreshedTokenData.refreshToken,
        expiresIn: 3600,
      });
      mockIdentityService.storeAuthTokens.mockResolvedValue(undefined);
      mockDIDVCServerClient.call.mockResolvedValue({ jobId: TEST_JOB_ID });
      mockDidIssuanceRequestRepository.update.mockResolvedValue({
        ...mockDidRequest,
        status: MockDidIssuanceStatus.PROCESSING,
        jobId: TEST_JOB_ID,
      });

      const result = await service.requestDIDIssuance(TEST_USER_ID, TEST_PHONE_UID, mockCtx);

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(TEST_REFRESH_TOKEN);
      expect(mockIdentityService.storeAuthTokens).toHaveBeenCalledWith(
        TEST_PHONE_UID,
        refreshedTokenData.authToken,
        refreshedTokenData.refreshToken,
        refreshedTokenData.expiryTime
      );
      expect(mockDIDVCServerClient.call).toHaveBeenCalledWith(
        TEST_PHONE_UID,
        refreshedTokenData.authToken,
        "/did/jobs/create-and-publish",
        "POST",
        { userId: TEST_USER_ID, requestId: TEST_REQUEST_ID }
      );
      expect(result.success).toBe(true);
    });

    it("should handle token refresh failure", async () => {
      const expiredIdentity = {
        ...mockIdentity,
        tokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };
      const refreshError = new Error("Token refresh failed");

      mockIdentityRepository.find.mockResolvedValue(expiredIdentity);
      mockDidIssuanceRequestRepository.create.mockResolvedValue(mockDidRequest);
      mockIdentityService.fetchNewIdToken.mockRejectedValue(refreshError);
      mockDidIssuanceRequestRepository.update.mockResolvedValue({
        ...mockDidRequest,
        status: MockDidIssuanceStatus.FAILED,
        errorMessage: "Token refresh failed",
      });

      const result = await service.requestDIDIssuance(TEST_USER_ID, TEST_PHONE_UID, mockCtx);

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(TEST_REFRESH_TOKEN);
      expect(mockDidIssuanceRequestRepository.update).toHaveBeenCalledWith(mockCtx, TEST_REQUEST_ID, {
        status: MockDidIssuanceStatus.FAILED,
        errorMessage: "Token refresh failed",
      });
      expect(result).toEqual({
        success: false,
        requestId: TEST_REQUEST_ID,
      });
    });

    it("should throw error when no valid token is available", async () => {
      const identityWithoutToken = {
        ...mockIdentity,
        authToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
      };

      mockIdentityRepository.find.mockResolvedValue(identityWithoutToken);
      mockDidIssuanceRequestRepository.create.mockResolvedValue(mockDidRequest);

      await expect(service.requestDIDIssuance(TEST_USER_ID, TEST_PHONE_UID, mockCtx)).rejects.toThrow(
        "No valid authentication token available"
      );
    });

    it("should handle DID server API call failure", async () => {
      const apiError = new Error("DID server API failed");

      mockIdentityRepository.find.mockResolvedValue(mockIdentity);
      mockDidIssuanceRequestRepository.create.mockResolvedValue(mockDidRequest);
      mockDIDVCServerClient.call.mockRejectedValue(apiError);
      mockDidIssuanceRequestRepository.update.mockResolvedValue({
        ...mockDidRequest,
        status: MockDidIssuanceStatus.FAILED,
        errorMessage: "DID server API failed",
      });

      const result = await service.requestDIDIssuance(TEST_USER_ID, TEST_PHONE_UID, mockCtx);

      expect(mockDIDVCServerClient.call).toHaveBeenCalled();
      expect(mockDidIssuanceRequestRepository.update).toHaveBeenCalledWith(mockCtx, TEST_REQUEST_ID, {
        status: MockDidIssuanceStatus.FAILED,
        errorMessage: "DID server API failed",
      });
      expect(result).toEqual({
        success: false,
        requestId: TEST_REQUEST_ID,
      });
    });

    it("should handle empty user ID", async () => {
      mockIdentityRepository.find.mockResolvedValue(mockIdentity);
      mockDidIssuanceRequestRepository.create.mockResolvedValue({
        ...mockDidRequest,
        userId: "",
      });
      mockDIDVCServerClient.call.mockResolvedValue({ jobId: TEST_JOB_ID });

      const result = await service.requestDIDIssuance("", TEST_PHONE_UID, mockCtx);

      expect(mockDidIssuanceRequestRepository.create).toHaveBeenCalledWith(mockCtx, {
        userId: "",
        status: MockDidIssuanceStatus.PENDING,
      });
      expect(result.success).toBe(true);
    });

    it("should handle empty phone UID", async () => {
      mockIdentityRepository.find.mockResolvedValue(null);

      await expect(service.requestDIDIssuance(TEST_USER_ID, "", mockCtx)).rejects.toThrow(
        "No identity found for DID issuance"
      );

      expect(mockIdentityRepository.find).toHaveBeenCalledWith("");
    });
  });

  describe("evaluateTokenValidity", () => {
    it("should return valid token when token exists and is not expired", () => {
      const validIdentity: MockIdentity = {
        id: "identity-123",
        uid: TEST_PHONE_UID,
        authToken: TEST_TOKEN,
        tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };

      const result = service.evaluateTokenValidity(validIdentity as any);

      expect(result).toEqual({
        token: TEST_TOKEN,
        isValid: true,
      });
    });

    it("should return invalid when token is expired", () => {
      const expiredIdentity: MockIdentity = {
        id: "identity-123",
        uid: TEST_PHONE_UID,
        authToken: TEST_TOKEN,
        tokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };

      const result = service.evaluateTokenValidity(expiredIdentity as any);

      expect(result).toEqual({
        token: TEST_TOKEN,
        isValid: false,
      });
    });

    it("should return invalid when auth token is missing", () => {
      const identityWithoutToken: MockIdentity = {
        id: "identity-123",
        uid: TEST_PHONE_UID,
        authToken: null,
        tokenExpiresAt: new Date(Date.now() + 3600000),
      };

      const result = service.evaluateTokenValidity(identityWithoutToken as any);

      expect(result).toEqual({
        token: null,
        isValid: false,
      });
    });

    it("should return invalid when token expires at is missing", () => {
      const identityWithoutExpiry: MockIdentity = {
        id: "identity-123",
        uid: TEST_PHONE_UID,
        authToken: TEST_TOKEN,
        tokenExpiresAt: null,
      };

      const result = service.evaluateTokenValidity(identityWithoutExpiry as any);

      expect(result).toEqual({
        token: null,
        isValid: false,
      });
    });

    it("should return invalid when both token and expiry are missing", () => {
      const identityWithoutTokenData: MockIdentity = {
        id: "identity-123",
        uid: TEST_PHONE_UID,
        authToken: null,
        tokenExpiresAt: null,
      };

      const result = service.evaluateTokenValidity(identityWithoutTokenData as any);

      expect(result).toEqual({
        token: null,
        isValid: false,
      });
    });

    it("should handle edge case when token expires exactly now", () => {
      const now = new Date();
      const identityExpiringNow: MockIdentity = {
        id: "identity-123",
        uid: TEST_PHONE_UID,
        authToken: TEST_TOKEN,
        tokenExpiresAt: now,
      };

      const result = service.evaluateTokenValidity(identityExpiringNow as any);

      expect(result.token).toBe(TEST_TOKEN);
      expect(result.isValid).toBe(false);
    });
  });

  describe("refreshAuthToken", () => {
    const mockTokenResponse = {
      idToken: "new-id-token",
      refreshToken: "new-refresh-token",
      expiresIn: 3600,
    };

    it("should successfully refresh auth token", async () => {
      const expectedExpiryTime = new Date(Date.now() + 3600000);
      mockIdentityService.fetchNewIdToken.mockResolvedValue(mockTokenResponse);
      mockIdentityService.storeAuthTokens.mockResolvedValue(undefined);

      const result = await service.refreshAuthToken(TEST_PHONE_UID, TEST_REFRESH_TOKEN);

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(TEST_REFRESH_TOKEN);
      expect(mockIdentityService.storeAuthTokens).toHaveBeenCalledWith(
        TEST_PHONE_UID,
        mockTokenResponse.idToken,
        mockTokenResponse.refreshToken,
        expect.any(Date)
      );
      expect(result).toEqual({
        authToken: mockTokenResponse.idToken,
        refreshToken: mockTokenResponse.refreshToken,
        expiryTime: expect.any(Date),
      });
      expect(result.expiryTime.getTime()).toBeCloseTo(expectedExpiryTime.getTime(), -2);
    });

    it("should handle fetchNewIdToken failure", async () => {
      const fetchError = new Error("Failed to fetch new ID token");
      mockIdentityService.fetchNewIdToken.mockRejectedValue(fetchError);

      await expect(service.refreshAuthToken(TEST_PHONE_UID, TEST_REFRESH_TOKEN)).rejects.toThrow(
        "Failed to fetch new ID token"
      );

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(TEST_REFRESH_TOKEN);
      expect(mockIdentityService.storeAuthTokens).not.toHaveBeenCalled();
    });

    it("should handle storeAuthTokens failure", async () => {
      const storeError = new Error("Failed to store auth tokens");
      mockIdentityService.fetchNewIdToken.mockResolvedValue(mockTokenResponse);
      mockIdentityService.storeAuthTokens.mockRejectedValue(storeError);

      await expect(service.refreshAuthToken(TEST_PHONE_UID, TEST_REFRESH_TOKEN)).rejects.toThrow(
        "Failed to store auth tokens"
      );

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(TEST_REFRESH_TOKEN);
      expect(mockIdentityService.storeAuthTokens).toHaveBeenCalled();
    });

    it("should handle empty uid", async () => {
      mockIdentityService.fetchNewIdToken.mockResolvedValue(mockTokenResponse);
      mockIdentityService.storeAuthTokens.mockResolvedValue(undefined);

      const result = await service.refreshAuthToken("", TEST_REFRESH_TOKEN);

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(TEST_REFRESH_TOKEN);
      expect(mockIdentityService.storeAuthTokens).toHaveBeenCalledWith(
        "",
        mockTokenResponse.idToken,
        mockTokenResponse.refreshToken,
        expect.any(Date)
      );
      expect(result.authToken).toBe(mockTokenResponse.idToken);
    });

    it("should handle empty refresh token", async () => {
      const emptyTokenError = new Error("Invalid refresh token");
      mockIdentityService.fetchNewIdToken.mockRejectedValue(emptyTokenError);

      await expect(service.refreshAuthToken(TEST_PHONE_UID, "")).rejects.toThrow("Invalid refresh token");

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith("");
    });

    it("should calculate correct expiry time", async () => {
      const customExpiresIn = 7200; // 2 hours
      const customTokenResponse = {
        ...mockTokenResponse,
        expiresIn: customExpiresIn,
      };
      const expectedExpiryTime = new Date(Date.now() + customExpiresIn * 1000);

      mockIdentityService.fetchNewIdToken.mockResolvedValue(customTokenResponse);
      mockIdentityService.storeAuthTokens.mockResolvedValue(undefined);

      const result = await service.refreshAuthToken(TEST_PHONE_UID, TEST_REFRESH_TOKEN);

      expect(result.expiryTime.getTime()).toBeCloseTo(expectedExpiryTime.getTime(), -2);
    });
  });
});
