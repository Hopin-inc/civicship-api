/**
 * Session cookie expiration time in milliseconds (14 days)
 */
export const SESSION_EXPIRATION_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Session cookie name for Firebase compliance
 * Firebase Hosting expects "__session" as the cookie name
 */
export const SESSION_COOKIE_NAME = "__session";

/**
 * Returns a community-scoped session cookie name to avoid cross-community
 * session collisions when a browser accesses multiple communities.
 */
export const getSessionCookieName = (communityId: string) =>
  `${SESSION_COOKIE_NAME}_${communityId}`;
