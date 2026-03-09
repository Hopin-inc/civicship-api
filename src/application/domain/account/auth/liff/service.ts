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
  static async verifyAccessToken(
    accessToken: string,
    channelId: string,
  ): Promise<LINETokenVerifyResponse> {
    try {
      const response = await axios.get(
        `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`,
      );
      const data = response.data as LINETokenVerifyResponse;

      if (data.client_id !== channelId) {
        throw new Error(`LINE client_id mismatch: expected=${channelId}, actual=${data.client_id}`);
      }
      if (data.expires_in < 0) {
        throw new Error(`LINE access token is expired: ${data.expires_in}`);
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error.response?.data;
        throw new Error(
          `[LINE Token Verification] ${err?.error}: ${err?.error_description || error.message}`,
        );
      }
      throw new Error(
        `[LINE Token Verification] ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async getProfile(accessToken: string): Promise<LINEProfile> {
    try {
      const response = await axios.get("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data as LINEProfile;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error.response?.data;
        throw new Error(
          `[LINE Profile Fetch] ${err?.error}: ${err?.error_description || error.message}`,
        );
      }
      throw new Error(
        `[LINE Profile Fetch] ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async createFirebaseCustomToken(profile: LINEProfile, tenantId?: string): Promise<string> {
    try {
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

      const tenantedAuth = tenantId ? auth.tenantManager().authForTenant(tenantId) : auth;
      const customToken = await tenantedAuth.createCustomToken(profile.userId, customClaims);

      return customToken;
    } catch (error) {
      logger.error("Error creating Firebase custom token:", error);
      throw new Error("Failed to create authentication token");
    }
  }
}
