/**
 * Unit tests for `src/infrastructure/libs/did/userDidBuilder.ts`.
 *
 * Covers:
 *   - DID format (matches §9.2 regex shape)
 *   - minimal DID Document is `{ @context, id }` with NO verificationMethod (§B)
 *   - tombstone document has `deactivated: true` (§E)
 *   - userId regex enforces lowercase ASCII / digit / `_-` only (§9.2)
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.3, §B, §E, §9.2
 */

import {
  buildUserDid,
  buildMinimalDidDocument,
  buildDeactivatedDidDocument,
  assertValidUserId,
  USER_ID_REGEX,
  CIVICSHIP_DID_PREFIX,
} from "@/infrastructure/libs/did/userDidBuilder";

describe("buildUserDid", () => {
  it("produces the canonical did:web string for a valid userId", () => {
    expect(buildUserDid("u_abc123")).toBe(
      "did:web:api.civicship.app:users:u_abc123",
    );
  });

  it("matches the §9.2 DID-string regex", () => {
    const did = buildUserDid("ckspike12345");
    const re = /^did:web:api\.civicship\.app(:users:[a-z0-9_-]+)?$/;
    expect(re.test(did)).toBe(true);
  });

  it("starts with the public CIVICSHIP_DID_PREFIX constant", () => {
    expect(buildUserDid("u").startsWith(CIVICSHIP_DID_PREFIX)).toBe(true);
  });

  it.each([
    "U_ABC", // uppercase
    "u abc", // space
    "u/abc", // slash
    "u:abc", // colon (would break did:web path component)
    "u@abc", // @ symbol
    "u.abc", // dot
    "", // empty
  ])("throws on invalid userId %p", (badId) => {
    expect(() => buildUserDid(badId)).toThrow();
  });

  it("rejects userIds longer than the 64-char limit", () => {
    expect(() => buildUserDid("a".repeat(65))).toThrow(/length/);
  });

  it("accepts hyphen and underscore", () => {
    expect(() => buildUserDid("u-1_2-3")).not.toThrow();
  });
});

describe("buildMinimalDidDocument (§B — no verificationMethod)", () => {
  it("returns only @context and id", () => {
    const doc = buildMinimalDidDocument("u_abc");
    expect(doc).toEqual({
      "@context": ["https://www.w3.org/ns/did/v1"],
      id: "did:web:api.civicship.app:users:u_abc",
    });
  });

  it("does NOT include verificationMethod / authentication / assertionMethod", () => {
    const doc = buildMinimalDidDocument("u_abc") as unknown as Record<
      string,
      unknown
    >;
    expect(doc.verificationMethod).toBeUndefined();
    expect(doc.authentication).toBeUndefined();
    expect(doc.assertionMethod).toBeUndefined();
    expect(doc.keyAgreement).toBeUndefined();
    expect(doc.service).toBeUndefined();
  });

  it("propagates userId validation errors", () => {
    expect(() => buildMinimalDidDocument("BAD UPPER")).toThrow();
  });
});

describe("buildDeactivatedDidDocument (§E — Tombstone)", () => {
  it("includes deactivated: true and the same id as the live doc", () => {
    const live = buildMinimalDidDocument("u_dead");
    const tomb = buildDeactivatedDidDocument("u_dead");
    expect(tomb.id).toBe(live.id);
    expect(tomb.deactivated).toBe(true);
    expect(tomb["@context"]).toEqual(live["@context"]);
  });

  it("propagates userId validation errors", () => {
    expect(() => buildDeactivatedDidDocument("BAD")).toThrow();
  });
});

describe("assertValidUserId — §9.2 input validation", () => {
  it("regex matches the design spec: ^[a-z0-9_-]+$", () => {
    expect(USER_ID_REGEX.source).toBe("^[a-z0-9_-]+$");
  });

  it.each(["u_abc", "abc123", "ck123-456_789", "u-1", "a"])(
    "accepts %p",
    (good) => {
      expect(() => assertValidUserId(good)).not.toThrow();
    },
  );

  it.each([
    "U", // uppercase
    "u abc", // space
    "u/abc",
    "u:abc",
    "u.abc",
    "", // empty
    "あいう", // multibyte Japanese
    "u\nbreak", // newline
  ])("rejects %p", (bad) => {
    expect(() => assertValidUserId(bad)).toThrow();
  });

  it("returns the userId unchanged on success", () => {
    expect(assertValidUserId("u_abc")).toBe("u_abc");
  });
});
