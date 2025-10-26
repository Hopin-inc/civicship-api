import http from "http";
import logger from "@/infrastructure/logging";
import { AuthHeaders } from "./types";

export function extractAuthHeaders(req: http.IncomingMessage): AuthHeaders {
  const getHeader = (key: string) => (req.headers[key.toLowerCase()] as string) || "";

  const rawMode = getHeader("x-auth-mode");
  const authMode: "id_token" | "session" = rawMode === "session" ? "session" : "id_token";

  const headers: AuthHeaders = {
    authMode,
    idToken: getHeader("authorization")?.replace(/^Bearer\s+/, ""),
    adminApiKey: getHeader("x-civicship-admin-api-key"),
    communityId: getHeader("x-community-id") || process.env.COMMUNITY_ID,
    refreshToken: getHeader("x-refresh-token"),
    tokenExpiresAt: getHeader("x-token-expires-at"),
    phoneAuthToken: getHeader("x-phone-auth-token"),
    phoneRefreshToken: getHeader("x-phone-refresh-token"),
    phoneTokenExpiresAt: getHeader("x-phone-token-expires-at"),
    phoneUid: getHeader("x-phone-uid"),
  };

  logger.debug("🪶 Extracted auth headers", {
    hasIdToken: !!headers.idToken,
    hasAdminKey: !!headers.adminApiKey,
    communityId: headers.communityId,
  });

  return headers;
}
