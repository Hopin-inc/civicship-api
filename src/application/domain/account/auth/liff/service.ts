import axios from "axios";
import { SignInProvider } from "@/consts/utils";
import { auth } from "@/infrastructure/libs/firebase";
import logger from "@/infrastructure/logging";

export interface LINEProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
  language?: string;
}

export interface LINETokenVerifyResponse {
  client_id: string;
  expires_in: number;
}

export class LIFFService {
  /**
   * Verify LINE access token and return expiry time
   * @param accessToken Access token from LINE LIFF
   * @param channelId
   * @returns expires_in value from LINE API
   */
  static async verifyAccessToken(accessToken: string, channelId: string): Promise<number> {
    try {
      const response = await axios.get(
        `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`,
      );

      const data = response.data as LINETokenVerifyResponse;

      if (data.client_id !== channelId) {
        throw new Error(
          `Line client_id does not match: liffID: ${channelId} client_id: ${data.client_id}`,
        );
      }

      if (data.expires_in < 0) {
        throw new Error(`Line access token is expired: ${data.expires_in}`);
      }

      return data.expires_in;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        throw new Error(
          `[LINE Token Verification] ${errorData?.error}: ${errorData?.error_description || error.message}`,
        );
      }
      throw new Error(
        `[LINE Token Verification] ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get LINE user profile using access token
   * @param accessToken Access token from LINE LIFF
   * @returns LINE profile data
   */
  static async getProfile(accessToken: string): Promise<LINEProfile> {
    try {
      // LINEプロファイル取得エンドポイントを呼び出し
      const response = await axios.get("https://api.line.me/v2/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data as LINEProfile;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        throw new Error(
          `[LINE Profile Fetch] ${errorData?.error}: ${errorData?.error_description || error.message}`,
        );
      }
      throw new Error(
        `[LINE Profile Fetch] ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create Firebase custom token based on LINE profile
   * @param profile LINE user profile
   * @param tenantId
   * @returns Firebase custom token
   */
  static async createFirebaseCustomToken(profile: LINEProfile, tenantId?: string): Promise<string> {
    try {
      // Create custom claims with LINE user info
      const customClaims = {
        line: {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
          language: profile.language,
        },
        provider: SignInProvider["oidc.line"],
        platform: "LINE",
      };

      // Create Firebase custom token
      const tenantedAuth = tenantId ? auth.tenantManager().authForTenant(tenantId) : auth;
      const customToken = await tenantedAuth.createCustomToken(profile.userId, customClaims);
      return customToken;
    } catch (error) {
      logger.error("Error creating Firebase custom token:", error);
      throw new Error("Failed to create authentication token");
    }
  }
}
