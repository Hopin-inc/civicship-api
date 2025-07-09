import "reflect-metadata";
import { container } from "tsyringe";
import { LoggedInUserInfo } from "@/types/server";
import { EvaluationStatus } from "@prisma/client";

jest.mock("@/infrastructure/libs/firebase", () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import { EvaluationCredentialPayload } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";

describe("VCIssuanceRequestService", () => {
  class MockVCIssuanceRequestRepository {
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

  class MockDIDIssuanceRequestRepository {
    find = jest.fn();
    create = jest.fn();
    update = jest.fn();
    query = jest.fn();
    findLatestCompletedByUserId = jest.fn();
  }

  class MockIdentityService {
    fetchNewIdToken = jest.fn();
    storeAuthTokens = jest.fn();
  }

  let mockVCIssuanceRequestRepository: MockVCIssuanceRequestRepository;
  let mockIdentityRepository: MockIdentityRepository;
  let mockDIDIssuanceRequestRepository: MockDIDIssuanceRequestRepository;
  let mockClient: MockDIDVCServerClient;
  let mockIdentityService: MockIdentityService;
  let service: VCIssuanceRequestService;

  const mockCtx = { currentUser: { id: "user-1" } };
  const mockUserId = "user-1";
  const mockEvaluationId = "evaluation-1";
  const mockPhoneUid = "phone-uid-123";
  const mockToken = "valid-token";
  const mockRefreshToken = "refresh-token-123";

  const mockIdentity = {
    uid: mockPhoneUid,
    authToken: mockToken,
    refreshToken: mockRefreshToken,
    tokenExpiresAt: new Date(Date.now() + 3600000),
  };

  const mockVCRequest: EvaluationCredentialPayload = {
    claims: {
      type: "EvaluationCredential",
      score: EvaluationStatus.PASSED,
      evaluator: {
        id: "evaluator-1",
        name: "Test Evaluator",
      },
      participant: {
        id: "participant-1",
        name: "Test Participant",
      },
      opportunity: {
        id: "opportunity-1",
        title: "Test Opportunity",
      },
    },
    credentialFormat: "JWT",
    schemaId: "schema-123",
  };

  const mockVCIssuanceRequest = {
    id: "vc-request-1",
    userId: mockUserId,
    evaluationId: mockEvaluationId,
    status: "PENDING",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockVCIssuanceRequestRepository = new MockVCIssuanceRequestRepository();
    mockIdentityRepository = new MockIdentityRepository();
    mockDIDIssuanceRequestRepository = new MockDIDIssuanceRequestRepository();
    mockClient = new MockDIDVCServerClient();
    mockIdentityService = new MockIdentityService();

    container.register("VCIssuanceRequestRepository", {
      useValue: mockVCIssuanceRequestRepository,
    });
    container.register("IdentityRepository", { useValue: mockIdentityRepository });
    container.register("DIDIssuanceRequestRepository", { useValue: mockDIDIssuanceRequestRepository });
    container.register("DIDVCServerClient", { useValue: mockClient });
    container.register("IdentityService", { useValue: mockIdentityService });
    container.register("VCIssuanceRequestConverter", { useValue: {} });

    service = container.resolve(VCIssuanceRequestService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("requestVCIssuance - success scenarios", () => {
    beforeEach(() => {
      mockVCIssuanceRequestRepository.create.mockResolvedValue(mockVCIssuanceRequest);
      mockIdentityRepository.find.mockResolvedValue(mockIdentity);
      mockDIDIssuanceRequestRepository.findLatestCompletedByUserId.mockResolvedValue({
        didValue: "did:example:123456789",
      });
    });

    it("should successfully request VC issuance with valid token", async () => {
      const mockResponse = { jobId: "job-123" };
      mockClient.call.mockResolvedValue(mockResponse);

      const result = await service.requestVCIssuance(
        mockUserId,
        mockPhoneUid,
        mockVCRequest,
        mockCtx as LoggedInUserInfo,
        mockEvaluationId
      );

      expect(mockClient.call).toHaveBeenCalledWith(
        mockPhoneUid,
        mockToken,
        "/vc/jobs/connectionless/issue-to-holder",
        "POST",
        {
          claims: mockVCRequest.claims,
          credentialFormat: mockVCRequest.credentialFormat,
          schemaId: mockVCRequest.schemaId,
        }
      );
      expect(mockVCIssuanceRequestRepository.update).toHaveBeenCalledWith(
        mockCtx,
        mockVCIssuanceRequest.id,
        {
          status: "PROCESSING",
          jobId: "job-123",
        }
      );
      expect(result).toEqual({
        success: true,
        requestId: mockVCIssuanceRequest.id,
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

      const result = await service.requestVCIssuance(
        mockUserId,
        mockPhoneUid,
        mockVCRequest,
        mockCtx as LoggedInUserInfo,
        mockEvaluationId
      );

      expect(mockIdentityService.fetchNewIdToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockClient.call).toHaveBeenCalledWith(
        mockPhoneUid,
        "new-token",
        "/vc/jobs/connectionless/issue-to-holder",
        "POST",
        {
          claims: mockVCRequest.claims,
          credentialFormat: mockVCRequest.credentialFormat,
          schemaId: mockVCRequest.schemaId,
        }
      );
      expect(result.success).toBe(true);
    });
  });

  describe("requestVCIssuance - external API failure scenarios", () => {
    beforeEach(() => {
      mockVCIssuanceRequestRepository.create.mockResolvedValue(mockVCIssuanceRequest);
      mockIdentityRepository.find.mockResolvedValue(mockIdentity);
      mockDIDIssuanceRequestRepository.findLatestCompletedByUserId.mockResolvedValue({
        didValue: "did:example:123456789",
      });
    });

    it("should handle external API failure (null response) gracefully", async () => {
      mockClient.call.mockResolvedValue(null);

      const result = await service.requestVCIssuance(
        mockUserId,
        mockPhoneUid,
        mockVCRequest,
        mockCtx as LoggedInUserInfo,
        mockEvaluationId
      );

      expect(mockClient.call).toHaveBeenCalledWith(
        mockPhoneUid,
        mockToken,
        "/vc/jobs/connectionless/issue-to-holder",
        "POST",
        {
          claims: mockVCRequest.claims,
          credentialFormat: mockVCRequest.credentialFormat,
          schemaId: mockVCRequest.schemaId,
        }
      );
      expect(mockVCIssuanceRequestRepository.update).toHaveBeenCalledWith(
        mockCtx,
        mockVCIssuanceRequest.id,
        {
          errorMessage: "External API call failed",
          retryCount: { increment: 1 },
        }
      );
      expect(result).toEqual({
        success: true,
        requestId: mockVCIssuanceRequest.id,
      });
    });

    it("should continue processing when token refresh fails but token exists", async () => {
      const expiredIdentity = {
        ...mockIdentity,
        tokenExpiresAt: new Date(Date.now() - 3600000),
      };
      mockIdentityRepository.find.mockResolvedValue(expiredIdentity);
      mockIdentityService.fetchNewIdToken.mockResolvedValue(null);

      const mockResponse = { jobId: "job-123" };
      mockClient.call.mockResolvedValue(mockResponse);

      const result = await service.requestVCIssuance(
        mockUserId,
        mockPhoneUid,
        mockVCRequest,
        mockCtx as LoggedInUserInfo,
        mockEvaluationId
      );

      expect(mockClient.call).toHaveBeenCalledWith(
        mockPhoneUid,
        mockToken,
        "/vc/jobs/connectionless/issue-to-holder",
        "POST",
        {
          claims: mockVCRequest.claims,
          credentialFormat: mockVCRequest.credentialFormat,
          schemaId: mockVCRequest.schemaId,
        }
      );
      expect(result.success).toBe(true);
    });

    it("should handle case when no token is available after refresh failure", async () => {
      const identityWithoutToken = {
        ...mockIdentity,
        authToken: null,
        tokenExpiresAt: new Date(Date.now() - 3600000),
      };
      mockIdentityRepository.find.mockResolvedValue(identityWithoutToken);
      mockIdentityService.fetchNewIdToken.mockResolvedValue(null);

      const result = await service.requestVCIssuance(
        mockUserId,
        mockPhoneUid,
        mockVCRequest,
        mockCtx as LoggedInUserInfo,
        mockEvaluationId
      );

      expect(mockClient.call).not.toHaveBeenCalled();
      expect(mockVCIssuanceRequestRepository.update).toHaveBeenCalledWith(
        mockCtx,
        mockVCIssuanceRequest.id,
        {
          errorMessage: "No authentication token available",
          processedAt: expect.any(Date),
          retryCount: { increment: 1 },
          status: "FAILED",
        }
      );
      expect(result).toEqual({
        success: false,
        requestId: mockVCIssuanceRequest.id,
      });
    });

    it("should handle case when no DID is found for user", async () => {
      mockDIDIssuanceRequestRepository.findLatestCompletedByUserId.mockResolvedValue(null);

      const result = await service.requestVCIssuance(
        mockUserId,
        mockPhoneUid,
        mockVCRequest,
        mockCtx as LoggedInUserInfo,
        mockEvaluationId,
      );

      expect(mockClient.call).not.toHaveBeenCalled();
      expect(mockVCIssuanceRequestRepository.update).toHaveBeenCalledWith(
        mockCtx,
        mockVCIssuanceRequest.id,
        {
          status: "PENDING",
          processedAt: expect.any(Date),
        },
      );
      expect(result).toEqual({
        success: false,
        requestId: mockVCIssuanceRequest.id,
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
      mockIdentityService.storeAuthTokens.mockResolvedValue(undefined);

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
        authToken: "valid-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
      };

      const result = service.evaluateTokenValidity(validIdentity as { authToken: string; tokenExpiresAt: Date | null });

      expect(result).toEqual({
        token: "valid-token",
        isValid: true,
      });
    });

    it("should return invalid token when expired", () => {
      const expiredIdentity = {
        authToken: "expired-token",
        tokenExpiresAt: new Date(Date.now() - 3600000),
      };

      const result = service.evaluateTokenValidity(expiredIdentity as { authToken: string; tokenExpiresAt: Date | null });

      expect(result).toEqual({
        token: "expired-token",
        isValid: false,
      });
    });

    it("should return invalid when tokenExpiresAt is null", () => {
      const identityWithoutExpiry = {
        authToken: "token",
        tokenExpiresAt: null,
      };

      const result = service.evaluateTokenValidity(identityWithoutExpiry as { authToken: string; tokenExpiresAt: Date | null });

      expect(result).toEqual({
        token: null,
        isValid: false,
      });
    });
  });
});
