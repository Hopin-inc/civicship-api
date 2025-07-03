import axios from "axios";
import { LIFFService, LINEProfile, LINETokenVerifyResponse } from "@/application/domain/account/auth/liff/service";
import { SignInProvider } from "@/consts/utils";
import { auth } from "@/infrastructure/libs/firebase";

jest.mock("axios");
jest.mock("@/infrastructure/libs/firebase");
jest.mock("@/infrastructure/logging");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAuth = auth as jest.Mocked<typeof auth>;

describe("LIFFService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyAccessToken", () => {
    const accessToken = "valid-access-token";
    const channelId = "test-channel-id";

    it("should verify access token successfully", async () => {
      const mockResponse: LINETokenVerifyResponse = {
        client_id: channelId,
        expires_in: 3600,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).resolves.not.toThrow();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`
      );
    });

    it("should throw error when client_id does not match", async () => {
      const mockResponse: LINETokenVerifyResponse = {
        client_id: "different-channel-id",
        expires_in: 3600,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).rejects.toThrow(
        `Line client_id does not match: liffID: ${channelId} client_id: different-channel-id`
      );
    });

    it("should throw error when token is expired", async () => {
      const mockResponse: LINETokenVerifyResponse = {
        client_id: channelId,
        expires_in: -1,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).rejects.toThrow(
        "Line access token is expired: -1"
      );
    });

    it("should handle axios error with error response", async () => {
      const errorResponse = {
        error: "invalid_token",
        error_description: "The access token is invalid",
      };

      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { data: errorResponse },
        message: "Request failed",
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).rejects.toThrow(
        "[LINE Token Verification] invalid_token: The access token is invalid"
      );
    });

    it("should handle axios error without error description", async () => {
      const errorResponse = {
        error: "invalid_token",
      };

      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { data: errorResponse },
        message: "Request failed",
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).rejects.toThrow(
        "[LINE Token Verification] invalid_token: Request failed"
      );
    });

    it("should handle axios error without response data", async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        message: "Network error",
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).rejects.toThrow(
        "[LINE Token Verification] undefined: Network error"
      );
    });

    it("should handle non-axios errors", async () => {
      const error = new Error("Generic error");
      mockedAxios.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).rejects.toThrow(
        "[LINE Token Verification] Generic error"
      );
    });

    it("should handle non-Error objects", async () => {
      mockedAxios.get.mockRejectedValue("String error");
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).rejects.toThrow(
        "[LINE Token Verification] String error"
      );
    });

    it("should handle zero expires_in as valid", async () => {
      const mockResponse: LINETokenVerifyResponse = {
        client_id: channelId,
        expires_in: 0,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      await expect(LIFFService.verifyAccessToken(accessToken, channelId)).resolves.not.toThrow();
    });

    it("should handle empty access token", async () => {
      const mockResponse: LINETokenVerifyResponse = {
        client_id: channelId,
        expires_in: 3600,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      await expect(LIFFService.verifyAccessToken("", channelId)).resolves.not.toThrow();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.line.me/oauth2/v2.1/verify?access_token="
      );
    });

    it("should handle empty channel id", async () => {
      const mockResponse: LINETokenVerifyResponse = {
        client_id: "",
        expires_in: 3600,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      await expect(LIFFService.verifyAccessToken(accessToken, "")).resolves.not.toThrow();
    });
  });

  describe("getProfile", () => {
    const accessToken = "valid-access-token";

    it("should get LINE profile successfully", async () => {
      const mockProfile: LINEProfile = {
        userId: "line-user-123",
        displayName: "Test User",
        pictureUrl: "https://example.com/picture.jpg",
        statusMessage: "Hello World",
        email: "test@example.com",
        language: "ja",
      };

      mockedAxios.get.mockResolvedValue({ data: mockProfile });

      const result = await LIFFService.getProfile(accessToken);

      expect(mockedAxios.get).toHaveBeenCalledWith("https://api.line.me/v2/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      expect(result).toEqual(mockProfile);
    });

    it("should get profile with minimal data", async () => {
      const mockProfile: LINEProfile = {
        userId: "line-user-123",
        displayName: "Test User",
      };

      mockedAxios.get.mockResolvedValue({ data: mockProfile });

      const result = await LIFFService.getProfile(accessToken);

      expect(result).toEqual(mockProfile);
    });

    it("should handle axios error with error response", async () => {
      const errorResponse = {
        error: "invalid_token",
        error_description: "The access token is invalid",
      };

      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { data: errorResponse },
        message: "Request failed",
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(LIFFService.getProfile(accessToken)).rejects.toThrow(
        "[LINE Profile Fetch] invalid_token: The access token is invalid"
      );
    });

    it("should handle axios error without error description", async () => {
      const errorResponse = {
        error: "invalid_token",
      };

      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { data: errorResponse },
        message: "Request failed",
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(LIFFService.getProfile(accessToken)).rejects.toThrow(
        "[LINE Profile Fetch] invalid_token: Request failed"
      );
    });

    it("should handle axios error without response data", async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        message: "Network error",
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(LIFFService.getProfile(accessToken)).rejects.toThrow(
        "[LINE Profile Fetch] undefined: Network error"
      );
    });

    it("should handle non-axios errors", async () => {
      const error = new Error("Generic error");
      mockedAxios.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(LIFFService.getProfile(accessToken)).rejects.toThrow(
        "[LINE Profile Fetch] Generic error"
      );
    });

    it("should handle non-Error objects", async () => {
      mockedAxios.get.mockRejectedValue("String error");
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(LIFFService.getProfile(accessToken)).rejects.toThrow(
        "[LINE Profile Fetch] String error"
      );
    });

    it("should handle empty access token", async () => {
      const mockProfile: LINEProfile = {
        userId: "line-user-123",
        displayName: "Test User",
      };

      mockedAxios.get.mockResolvedValue({ data: mockProfile });

      const result = await LIFFService.getProfile("");

      expect(mockedAxios.get).toHaveBeenCalledWith("https://api.line.me/v2/profile", {
        headers: {
          Authorization: "Bearer ",
        },
      });
      expect(result).toEqual(mockProfile);
    });
  });

  describe("createFirebaseCustomToken", () => {
    const mockProfile: LINEProfile = {
      userId: "line-user-123",
      displayName: "Test User",
      pictureUrl: "https://example.com/picture.jpg",
      statusMessage: "Hello World",
      language: "ja",
    };

    const mockTenantedAuth = {
      createCustomToken: jest.fn(),
    };

    const mockTenantManager = {
      authForTenant: jest.fn().mockReturnValue(mockTenantedAuth),
    };

    beforeEach(() => {
      mockedAuth.createCustomToken = jest.fn();
      mockedAuth.tenantManager = jest.fn().mockReturnValue(mockTenantManager);
    });

    it("should create Firebase custom token without tenant", async () => {
      const customToken = "custom-token-123";
      mockedAuth.createCustomToken.mockResolvedValue(customToken);

      const result = await LIFFService.createFirebaseCustomToken(mockProfile);

      expect(mockedAuth.createCustomToken).toHaveBeenCalledWith(
        mockProfile.userId,
        {
          line: {
            userId: mockProfile.userId,
            displayName: mockProfile.displayName,
            pictureUrl: mockProfile.pictureUrl,
            statusMessage: mockProfile.statusMessage,
            language: mockProfile.language,
          },
          provider: SignInProvider["oidc.line"],
          platform: "LINE",
        }
      );
      expect(result).toBe(customToken);
    });

    it("should create Firebase custom token with tenant", async () => {
      const tenantId = "test-tenant-id";
      const customToken = "custom-token-123";
      mockTenantedAuth.createCustomToken.mockResolvedValue(customToken);

      const result = await LIFFService.createFirebaseCustomToken(mockProfile, tenantId);

      expect(mockedAuth.tenantManager).toHaveBeenCalled();
      expect(mockTenantManager.authForTenant).toHaveBeenCalledWith(tenantId);
      expect(mockTenantedAuth.createCustomToken).toHaveBeenCalledWith(
        mockProfile.userId,
        {
          line: {
            userId: mockProfile.userId,
            displayName: mockProfile.displayName,
            pictureUrl: mockProfile.pictureUrl,
            statusMessage: mockProfile.statusMessage,
            language: mockProfile.language,
          },
          provider: SignInProvider["oidc.line"],
          platform: "LINE",
        }
      );
      expect(result).toBe(customToken);
    });

    it("should create custom token with minimal profile data", async () => {
      const minimalProfile: LINEProfile = {
        userId: "line-user-123",
        displayName: "Test User",
      };
      const customToken = "custom-token-123";
      mockedAuth.createCustomToken.mockResolvedValue(customToken);

      const result = await LIFFService.createFirebaseCustomToken(minimalProfile);

      expect(mockedAuth.createCustomToken).toHaveBeenCalledWith(
        minimalProfile.userId,
        {
          line: {
            userId: minimalProfile.userId,
            displayName: minimalProfile.displayName,
            pictureUrl: undefined,
            statusMessage: undefined,
            language: undefined,
          },
          provider: SignInProvider["oidc.line"],
          platform: "LINE",
        }
      );
      expect(result).toBe(customToken);
    });

    it("should handle Firebase auth error without tenant", async () => {
      const error = new Error("Firebase auth error");
      mockedAuth.createCustomToken.mockRejectedValue(error);

      await expect(LIFFService.createFirebaseCustomToken(mockProfile)).rejects.toThrow(
        "Failed to create authentication token"
      );
    });

    it("should handle Firebase auth error with tenant", async () => {
      const tenantId = "test-tenant-id";
      const error = new Error("Firebase auth error");
      mockTenantedAuth.createCustomToken.mockRejectedValue(error);

      await expect(LIFFService.createFirebaseCustomToken(mockProfile, tenantId)).rejects.toThrow(
        "Failed to create authentication token"
      );
    });

    it("should handle empty tenant id", async () => {
      const customToken = "custom-token-123";
      mockedAuth.createCustomToken.mockResolvedValue(customToken);

      const result = await LIFFService.createFirebaseCustomToken(mockProfile, "");

      expect(mockedAuth.createCustomToken).toHaveBeenCalled();
      expect(result).toBe(customToken);
    });

    it("should handle undefined tenant id", async () => {
      const customToken = "custom-token-123";
      mockedAuth.createCustomToken.mockResolvedValue(customToken);

      const result = await LIFFService.createFirebaseCustomToken(mockProfile, undefined);

      expect(mockedAuth.createCustomToken).toHaveBeenCalled();
      expect(result).toBe(customToken);
    });

    it("should handle profile with empty user id", async () => {
      const profileWithEmptyUserId: LINEProfile = {
        userId: "",
        displayName: "Test User",
      };
      const customToken = "custom-token-123";
      mockedAuth.createCustomToken.mockResolvedValue(customToken);

      const result = await LIFFService.createFirebaseCustomToken(profileWithEmptyUserId);

      expect(mockedAuth.createCustomToken).toHaveBeenCalledWith(
        "",
        expect.objectContaining({
          line: expect.objectContaining({
            userId: "",
            displayName: "Test User",
          }),
        })
      );
      expect(result).toBe(customToken);
    });

    it("should handle profile with empty display name", async () => {
      const profileWithEmptyDisplayName: LINEProfile = {
        userId: "line-user-123",
        displayName: "",
      };
      const customToken = "custom-token-123";
      mockedAuth.createCustomToken.mockResolvedValue(customToken);

      const result = await LIFFService.createFirebaseCustomToken(profileWithEmptyDisplayName);

      expect(mockedAuth.createCustomToken).toHaveBeenCalledWith(
        "line-user-123",
        expect.objectContaining({
          line: expect.objectContaining({
            userId: "line-user-123",
            displayName: "",
          }),
        })
      );
      expect(result).toBe(customToken);
    });
  });
});
