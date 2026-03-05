/**
 * Session cookie expiration time in milliseconds (14 days)
 */
export const SESSION_EXPIRATION_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Legacy session cookie name. Kept for backward-compatible fallback reads.
 * New logins use community-scoped names (see getSessionCookieName).
 */
export const SESSION_COOKIE_NAME = "__session";

/**
 * Returns a community-scoped session cookie name to avoid cross-community
 * session collisions when a browser accesses multiple communities.
 */
export const getSessionCookieName = (communityId: string) =>
  `${SESSION_COOKIE_NAME}_${communityId}`;
