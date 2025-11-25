import http from "http";
import logger from "@/infrastructure/logging";
import { AuthHeaders } from "./types";

export function extractAuthHeaders(req: http.IncomingMessage): AuthHeaders {
  const getHeader = (key: string) => (req.headers[key.toLowerCase()] as string) || "";

  const rawMode = getHeader("x-auth-mode");
  const authMode: "id_token" | "session" = rawMode === "session" ? "session" : "id_token";

  const cookies = Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((v) => v.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v || "")]),
  );

  // Support both "session" and "__session" cookie names for compatibility
  const sessionCookie = cookies["session"] || cookies["__session"];

  const bearer = getHeader("authorization")?.replace(/^Bearer\s+/, "");

  // In session mode, use only the session cookie; in id_token mode, use only Authorization header
  const idToken = authMode === "session" ? sessionCookie : bearer;

  const headers: AuthHeaders = {
    authMode,
    idToken,
    adminApiKey: getHeader("x-civicship-admin-api-key"),
    communityId: getHeader("x-community-id"),
  };

  logger.debug("🪶 Extracted auth headers", {
    authMode,
    hasIdToken: !!headers.idToken,
    hasCookie: !!req.headers.cookie,
    hasAdminKey: !!headers.adminApiKey,
    communityId: headers.communityId,
  });

  return headers;
}
