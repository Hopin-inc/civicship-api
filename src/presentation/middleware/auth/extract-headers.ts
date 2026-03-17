import http from "http";
import logger from "@/infrastructure/logging";
import { AuthHeaders } from "./types";
import { SESSION_COOKIE_NAME, getSessionCookieName } from "@/config/constants";

function safeDecodeURIComponent(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch (e) {
    logger.warn("Failed to decode cookie value, returning raw value", {
      error: (e as Error).message,
    });
    return v;
  }
}

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
      .map(([k, v]) => [k, safeDecodeURIComponent(v || "")]),
  );

  // Validate communityId format: allow only alphanumeric, hyphens, and underscores.
  // Reject values like ".env" or other obviously invalid/malicious inputs.
  const rawCommunityId = getHeader("x-community-id");
  const isValidCommunityId = !rawCommunityId || /^[a-zA-Z0-9_-]+$/.test(rawCommunityId);
  const communityId = isValidCommunityId ? rawCommunityId : "";

  if (rawCommunityId && !isValidCommunityId) {
    logger.warn("Invalid communityId format rejected", {
      rawCommunityId,
      component: "extractAuthHeaders",
    });
  }

  // Prefer community-scoped cookie, fall back to legacy "__session" / "session" for backward compatibility
  const sessionCookie = communityId
    ? cookies[getSessionCookieName(communityId)] ||
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
    communityId,
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
