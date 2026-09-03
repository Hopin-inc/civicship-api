import logger from "@/infrastructure/logging";

/**
 * Dev-only auto login.
 *
 * Lets a tester open a non-production deployment already signed in as a real,
 * community-joined user — without a LINE account and without Firebase. The point
 * is that it needs no setup at all: no flags, no shared secret, nothing to
 * configure. `ENV` alone decides, and `ENV` is already set per deployment.
 *
 * ## Why there is no signing key
 *
 * An earlier revision signed the token with a configured secret. That secret was
 * the only thing this feature needed configuring, and a per-process random key is
 * not an option — Cloud Run runs several instances, so a token minted by one
 * would fail to verify on another.
 *
 * So the authority of the token is bounded instead of being protected by a key.
 * `/dev-auth/session` mints throwaway users and nothing else, and a token is only
 * ever honoured for a uid under DEV_UID_PREFIX. Forging one therefore buys
 * exactly what calling the endpoint openly already gives you: a fresh disposable
 * account on a dev database. It cannot name a LINE identity, so it cannot be used
 * to become a real user — which is the escalation that would have mattered.
 *
 * The token is an identifier, not a credential. It is not signed and does not
 * pretend to be.
 */

/** ENV values on which dev login may be enabled. Anything else (including unset) disables it. */
const ALLOWED_ENVS = new Set(["LOCAL", "local", "dev", "development", "staging"]);

/** Dev tokens are short-lived — long enough for a test session, short enough to not linger. */
export const DEV_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

/** Cookie the portal sets on its own domain; forwarded to us on SSR requests. */
export const DEV_TOKEN_COOKIE_NAME = "dev_auth_token";

/** Header the portal's browser-side Apollo client sends. */
export const DEV_TOKEN_HEADER_NAME = "x-dev-auth-token";

/** Marks a dev token unambiguously so it can never be mistaken for a Firebase JWT. */
const DEV_TOKEN_PREFIX = "dev";

/**
 * Every identity this feature creates carries this prefix, and only uids carrying
 * it are ever resolved from a dev token. That bound is what makes the unsigned
 * token safe, so it is load-bearing rather than cosmetic.
 */
export const DEV_UID_PREFIX = "dev-anon-";

/**
 * Whether dev login is available on this deployment.
 *
 * Fail-closed on `ENV`: production sets it to nothing at all — the prd deploy
 * workflows never pass it — so an unset or unrecognised value disables the whole
 * path. Evaluated per request rather than cached at startup.
 */
export function isDevLoginEnabled(): boolean {
  return ALLOWED_ENVS.has(process.env.ENV ?? "");
}

export interface DevTokenPayload {
  uid: string;
  communityId: string;
  /** Epoch milliseconds. */
  exp: number;
}

export function issueDevToken(
  uid: string,
  communityId: string,
): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + DEV_TOKEN_TTL_MS;
  const payload: DevTokenPayload = { uid, communityId, exp: expiresAt };
  const body = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  return { token: `${DEV_TOKEN_PREFIX}.${body}`, expiresAt };
}

/**
 * Decodes a dev token and checks everything that bounds its authority: the
 * marker, the shape, the expiry, and above all that the uid is one this feature
 * minted. Returns null for anything else — including when dev login is disabled,
 * so a token from a dev deployment is inert against production.
 */
export function verifyDevToken(token: string | undefined): DevTokenPayload | null {
  if (!token || !isDevLoginEnabled()) return null;

  const parts = token.split(".");
  if (parts.length !== 2 || parts[0] !== DEV_TOKEN_PREFIX) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    ) as DevTokenPayload;

    if (!payload?.uid || !payload?.communityId || typeof payload.exp !== "number") return null;

    // The bound that replaces a signature: a dev token can only ever name an
    // account this feature created, never a LINE identity.
    if (!payload.uid.startsWith(DEV_UID_PREFIX)) {
      logger.warn("🚫 [devAuth] Dev token names a non-dev uid", { component: "devAuth" });
      return null;
    }

    if (payload.exp <= Date.now()) {
      logger.debug("🚫 [devAuth] Dev token expired", { exp: payload.exp });
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
