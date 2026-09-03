import crypto from "crypto";
import logger from "@/infrastructure/logging";

/**
 * Dev-only impersonation login.
 *
 * Lets a tester sign in as an already-seeded user WITHOUT going through LINE
 * or Firebase at all — the whole point is to be able to smoke-test the portal
 * on a non-production deployment where neither is usable.
 *
 * This is a genuine authentication bypass, so it is fail-closed on three
 * independent axes. Every one of them must be satisfied or the entire code
 * path behaves as if it does not exist:
 *
 *   1. DEV_LOGIN_ENABLED must be exactly "true" (explicit opt-in).
 *   2. ENV must be one of the known non-production values. An unset or
 *      unrecognised ENV — which is what production looks like — disables it.
 *   3. DEV_LOGIN_SECRET must be set and at least 32 chars, so a deployment
 *      cannot accidentally enable this with an empty/guessable secret.
 *
 * It NEVER creates users: the caller must name the uid of an Identity that
 * already exists for the target community.
 */

/** ENV values on which dev login may be enabled. Anything else (including unset) disables it. */
const ALLOWED_ENVS = new Set(["LOCAL", "local", "dev", "development", "staging"]);

const MIN_SECRET_LENGTH = 32;

/** Dev tokens are short-lived — long enough for a test session, short enough to not linger. */
export const DEV_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

/** Cookie the portal sets on its own domain; forwarded to us on SSR requests. */
export const DEV_TOKEN_COOKIE_NAME = "dev_auth_token";

/** Header the portal's browser-side Apollo client sends. */
export const DEV_TOKEN_HEADER_NAME = "x-dev-auth-token";

/** Marks a dev token unambiguously so it can never be mistaken for a Firebase JWT. */
const DEV_TOKEN_PREFIX = "dev";

const getSecret = (): string => process.env.DEV_LOGIN_SECRET ?? "";

export function isDevLoginEnabled(): boolean {
  return (
    process.env.DEV_LOGIN_ENABLED === "true" &&
    ALLOWED_ENVS.has(process.env.ENV ?? "") &&
    getSecret().length >= MIN_SECRET_LENGTH
  );
}

/**
 * Explains why dev login is off. For startup/diagnostic logging only —
 * never returned to a caller, since it would tell an attacker which knob to turn.
 */
export function describeDevLoginGate(): Record<string, boolean> {
  return {
    flagEnabled: process.env.DEV_LOGIN_ENABLED === "true",
    envAllowed: ALLOWED_ENVS.has(process.env.ENV ?? ""),
    secretConfigured: getSecret().length >= MIN_SECRET_LENGTH,
  };
}

export interface DevTokenPayload {
  uid: string;
  communityId: string;
  /** Epoch milliseconds. */
  exp: number;
}

const b64url = (buf: Buffer): string => buf.toString("base64url");

const sign = (body: string): string =>
  b64url(crypto.createHmac("sha256", getSecret()).update(body).digest());

export function issueDevToken(uid: string, communityId: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + DEV_TOKEN_TTL_MS;
  const payload: DevTokenPayload = { uid, communityId, exp: expiresAt };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf-8"));
  return { token: `${DEV_TOKEN_PREFIX}.${body}.${sign(body)}`, expiresAt };
}

/**
 * Verifies a dev token's signature and expiry.
 * Returns null for anything that is not a currently-valid dev token — including
 * when dev login is disabled, so a leaked token is worthless in production.
 */
export function verifyDevToken(token: string | undefined): DevTokenPayload | null {
  if (!token || !isDevLoginEnabled()) return null;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== DEV_TOKEN_PREFIX) return null;

  const [, body, signature] = parts;

  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  // timingSafeEqual throws on length mismatch, so compare lengths first.
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    logger.warn("🚫 [devAuth] Dev token signature mismatch");
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as DevTokenPayload;
    if (!payload?.uid || !payload?.communityId || typeof payload.exp !== "number") return null;
    if (payload.exp <= Date.now()) {
      logger.debug("🚫 [devAuth] Dev token expired", { exp: payload.exp });
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/** Constant-time comparison for the shared secret sent by the portal's server-side route. */
export function isValidDevLoginSecret(provided: string | undefined): boolean {
  if (!provided || !isDevLoginEnabled()) return false;
  const expected = Buffer.from(getSecret());
  const actual = Buffer.from(provided);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
