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
    communityId: getHeader("x-community-id"),
  };

  const hasCookie = !!req.headers.cookie;

  logger.debug("🪶 Extracted auth headers", {
    authMode,
    hasIdToken: !!headers.idToken,
    hasCookie,
    hasAdminKey: !!headers.adminApiKey,
    communityId: headers.communityId,
    hasPhoneAuthToken: !!headers.phoneAuthToken,
    hasPhoneUid: !!headers.phoneUid,
  });

  return headers;
}
