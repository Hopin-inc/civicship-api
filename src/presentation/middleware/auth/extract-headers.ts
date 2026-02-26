import http from "http";
import logger from "@/infrastructure/logging";
import { AuthHeaders } from "./types";
import { SESSION_COOKIE_NAME, getSessionCookieName } from "@/config/constants";

export function extractAuthHeaders(req: http.IncomingMessage): AuthHeaders {
  const getHeader = (key: string) => (req.headers[key.toLowerCase()] as string) || "";

  const rawMode = getHeader("x-auth-mode");
  const authMode: "id_token" | "session" = rawMode === "session" ? "session" : "id_token";

  const cookies = Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((v) => {
        const parts = v.trim().split("=");
        return [(parts.shift() || "").trim(), parts.join("=")];
      })
      .map(([k, v]) => [k, decodeURIComponent(v || "")]),
  );

  // Prefer community-scoped cookie, fall back to legacy "__session" / "session" for backward compatibility
  const communityIdForCookie = getHeader("x-community-id");
  const sessionCookie = communityIdForCookie
    ? cookies[getSessionCookieName(communityIdForCookie)] ||
      cookies[SESSION_COOKIE_NAME] ||
      cookies["session"]
    : cookies[SESSION_COOKIE_NAME] || cookies["session"];

  const bearer = getHeader("authorization")?.replace(/^Bearer\s+/, "");

  // In session mode, use only the session cookie; in id_token mode, use only Authorization header
  const idToken = authMode === "session" ? sessionCookie : bearer;

  const headers: AuthHeaders = {
    authMode,
    idToken,
    adminApiKey: getHeader("x-civicship-admin-api-key"),
    communityId: getHeader("x-community-id"),
    hasCookie: !!req.headers.cookie,
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
