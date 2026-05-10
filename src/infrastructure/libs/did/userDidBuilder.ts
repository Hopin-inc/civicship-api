/**
 * `did:web` builder for civicship User DIDs.
 *
 * Pure functions only — no I/O, no Prisma, no DI. Takes a userId, returns the
 * canonical DID string and minimal DID Document shapes.
 *
 * Design choice (§B): User DIDs do NOT carry a `verificationMethod`.
 *
 * Civicship is a platform-issued + no-VP-from-user model: the user never
 * holds or uses a private key, and we never need to verify a signature
 * authored by a User DID. W3C DID Core treats `verificationMethod` /
 * `authentication` / `assertionMethod` as omittable when no relationship is
 * present, so the minimal document is just `{ "@context", id }`. This keeps
 * the DID Document tiny (helpful for the 16 KB Cardano metadata ceiling
 * §5.1.6) and removes the need to ever generate, rotate, or manage user-side
 * Ed25519 keys.
 *
 * If/when Verifiable Presentations from users are needed (§10.1.3 future
 * extension), the user device will generate the keypair locally and POST the
 * public key to trigger an UPDATE op — at which point this builder grows a
 * `buildDidDocumentWithKey()` overload.
 *
 * userId regex (§9.2):
 *   `^[a-z0-9_-]+$` — cuid-compatible. Uppercase / `:` / `/` / spaces / etc.
 *   are rejected so that the resulting DID URL is unambiguous (no character
 *   that would need percent-encoding in the path component).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.3 (this builder)
 *   docs/report/did-vc-internalization.md §B (User の鍵は生成しない)
 *   docs/report/did-vc-internalization.md §E (Tombstone for deactivation)
 *   docs/report/did-vc-internalization.md §9.2 (input validation regex)
 */

/** The DID method-specific identifier prefix used by civicship. */
export const CIVICSHIP_DID_PREFIX = "did:web:api.civicship.app:users:";

/**
 * Allowed userId charset (§9.2).
 *
 * Must match the cuid character class so that DID URLs don't ever require
 * percent-encoding. Uppercase / colon / slash / whitespace are rejected.
 */
export const USER_ID_REGEX = /^[a-z0-9_-]+$/;

/** Minimum/maximum userId length. cuid is exactly 25 chars; we leave headroom
 * for future ID schemes but reject anything that would clearly be an attack
 * (empty strings, multi-KB blobs). */
const USER_ID_MIN = 1;
const USER_ID_MAX = 64;

export interface DidDocument {
  "@context": readonly string[];
  id: string;
}

export interface TombstoneDocument extends DidDocument {
  deactivated: true;
}

/**
 * Validate userId against the design §9.2 regex. Throws with an actionable
 * message on failure; otherwise returns the userId unchanged.
 */
export function assertValidUserId(userId: string): string {
  if (typeof userId !== "string") {
    throw new TypeError(`userId must be a string, got ${typeof userId}`);
  }
  if (userId.length < USER_ID_MIN || userId.length > USER_ID_MAX) {
    throw new Error(
      `userId length ${userId.length} out of range [${USER_ID_MIN}, ${USER_ID_MAX}]`,
    );
  }
  if (!USER_ID_REGEX.test(userId)) {
    throw new Error(
      `userId "${userId}" does not match ${USER_ID_REGEX} (design §9.2). ` +
        "Only lowercase ASCII letters, digits, underscore, and hyphen are permitted.",
    );
  }
  return userId;
}

/** Build the canonical did:web string for a civicship user. */
export function buildUserDid(userId: string): string {
  assertValidUserId(userId);
  return `${CIVICSHIP_DID_PREFIX}${userId}`;
}

/**
 * Build the minimal DID Document for a civicship user (§B).
 *
 * Contains only `@context` and `id`. No verificationMethod, no service, no
 * keyAgreement — none of which are required by W3C DID Core when no
 * verification relationship is present.
 */
export function buildMinimalDidDocument(userId: string): DidDocument {
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: buildUserDid(userId),
  };
}

/**
 * Build the tombstone (deactivated) DID Document for a civicship user (§E).
 *
 * The §5.4 router serves this on `/users/:userId/did.json` with HTTP 200
 * (NOT 404) when a DEACTIVATE op has been applied. Returning a real document
 * with `deactivated: true` lets downstream verifiers distinguish "user
 * existed and is gone" from "user never existed" — without leaking other
 * profile data.
 */
export function buildDeactivatedDidDocument(userId: string): TombstoneDocument {
  return {
    ...buildMinimalDidDocument(userId),
    deactivated: true,
  };
}
