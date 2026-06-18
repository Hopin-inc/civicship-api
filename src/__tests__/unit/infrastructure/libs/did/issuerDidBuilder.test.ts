/**
 * Unit tests for `src/infrastructure/libs/did/issuerDidBuilder.ts`.
 *
 * Covers:
 *   - `buildIssuerDid()` is argument-less and returns the canonical DID
 *   - `buildIssuerDidDocument()` shape matches the W3C did:web + Multikey contract
 *   - `verificationMethod[0].publicKeyMultibase` round-trips against
 *     `multiformats/bases/base58` (i.e. our hand-rolled base58 produces the
 *     same string the multiformats package would produce)
 *   - `service[]` declares the civicship attendance VC type
 *   - bad inputs (wrong-length pubkey, non-hex) throw
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.2, §3.3, §5.4.1
 *   W3C DID Core, W3C Multikey
 */

import {
  CIVICSHIP_ISSUER_DID,
  CIVICSHIP_ATTENDANCE_VC_TYPE,
  buildIssuerDid,
  buildIssuerDidDocument,
  buildMultiKeyIssuerDidDocument,
  encodeEd25519Jwk,
  encodeMultikeyEd25519,
  base58btcEncode,
  kmsResourceNameToKid,
  type IssuerActiveKey,
} from "@/infrastructure/libs/did/issuerDidBuilder";

const KEY_RESOURCE_V1 =
  "projects/p/locations/global/keyRings/civicship-issuer/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1";

const KEY_RESOURCE_V7 =
  "projects/p/locations/global/keyRings/civicship-issuer/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/7";

/** 32-byte test public key (lowercase hex). */
const PUB_HEX_32 = "ed".repeat(32);

describe("buildIssuerDid", () => {
  it("returns the civicship Issuer DID with no arguments", () => {
    expect(buildIssuerDid()).toBe("did:web:api.civicship.app");
    expect(buildIssuerDid()).toBe(CIVICSHIP_ISSUER_DID);
  });
});

describe("buildIssuerDidDocument", () => {
  it("returns a Document with id == issuer DID", () => {
    const doc = buildIssuerDidDocument({
      kmsKeyResourceName: KEY_RESOURCE_V1,
      publicKeyEd25519Hex: PUB_HEX_32,
    });
    expect(doc.id).toBe("did:web:api.civicship.app");
  });

  it("includes the W3C DID + Multikey JSON-LD contexts", () => {
    const doc = buildIssuerDidDocument({
      kmsKeyResourceName: KEY_RESOURCE_V1,
      publicKeyEd25519Hex: PUB_HEX_32,
    });
    expect(doc["@context"]).toEqual([
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/multikey/v1",
    ]);
  });

  it("uses the KMS key version as the verificationMethod fragment", () => {
    const doc = buildIssuerDidDocument({
      kmsKeyResourceName: KEY_RESOURCE_V7,
      publicKeyEd25519Hex: PUB_HEX_32,
    });
    expect(doc.verificationMethod).toHaveLength(1);
    expect(doc.verificationMethod[0].id).toBe("did:web:api.civicship.app#key-7");
    expect(doc.verificationMethod[0].type).toBe("Multikey");
    expect(doc.verificationMethod[0].controller).toBe("did:web:api.civicship.app");
  });

  it("references the verificationMethod from assertionMethod and authentication", () => {
    const doc = buildIssuerDidDocument({
      kmsKeyResourceName: KEY_RESOURCE_V1,
      publicKeyEd25519Hex: PUB_HEX_32,
    });
    const vmId = doc.verificationMethod[0].id;
    expect(doc.assertionMethod).toEqual([vmId]);
    expect(doc.authentication).toEqual([vmId]);
  });

  it("publishes the civicship attendance credential type via the service block", () => {
    const doc = buildIssuerDidDocument({
      kmsKeyResourceName: KEY_RESOURCE_V1,
      publicKeyEd25519Hex: PUB_HEX_32,
    });
    expect(doc.service).toHaveLength(1);
    expect(doc.service[0].id).toBe("did:web:api.civicship.app#issued-credentials");
    expect(doc.service[0].type).toBe("CivicshipIssuedCredentials");
    expect(doc.service[0].serviceEndpoint).toEqual({
      credentialTypes: [CIVICSHIP_ATTENDANCE_VC_TYPE],
    });
  });

  it("rejects a non-32-byte public key (e.g. accidentally passing SPKI)", () => {
    expect(() =>
      buildIssuerDidDocument({
        kmsKeyResourceName: KEY_RESOURCE_V1,
        // 44-byte SPKI hex
        publicKeyEd25519Hex: "00".repeat(44),
      }),
    ).toThrow(/32 bytes/);
  });

  it("rejects non-hex characters in the public key", () => {
    expect(() =>
      buildIssuerDidDocument({
        kmsKeyResourceName: KEY_RESOURCE_V1,
        publicKeyEd25519Hex: "zz".repeat(32),
      }),
    ).toThrow(/invalid hex/);
  });
});

describe("encodeMultikeyEd25519 — multibase prefix and multicodec", () => {
  it("starts with the base58btc multibase prefix 'z'", () => {
    const raw = new Uint8Array(32).fill(0x01);
    const out = encodeMultikeyEd25519(raw);
    expect(out.startsWith("z")).toBe(true);
  });

  it("produces a known reference vector for an all-zero pubkey", () => {
    // Reference: 0xed01 || 32×0x00 → base58btc → checked against an
    // independent implementation. Encoded bytes: [0xed, 0x01, 0x00 ×32] (34 bytes).
    //
    // Computed here from a bit-exact reimplementation in a Node REPL.
    const raw = new Uint8Array(32);
    const out = encodeMultikeyEd25519(raw);
    expect(out).toBe("z6MkeTG3bFFSLYVU7VqhgZxqr6YzpaGrQtFMh1uvqGy1vDnP");
  });

  it("rejects a wrong-length raw key", () => {
    expect(() => encodeMultikeyEd25519(new Uint8Array(16))).toThrow(/32 bytes/);
    expect(() => encodeMultikeyEd25519(new Uint8Array(48))).toThrow(/32 bytes/);
  });

  /**
   * Independent reference vector for a non-trivial pubkey (i*7 mod 256).
   *
   * The expected string was generated against `multiformats/bases/base58`'s
   * `base58btc.encode(0xed01 || rawKey)` and pasted verbatim. We don't run
   * `multiformats` from inside Jest because the package is ESM-only and
   * ts-jest's CJS transformer rewrites dynamic imports into `require()`
   * (which fails). A pinned reference vector is the cleanest equivalent —
   * if our hand-rolled encoder ever drifts, this test breaks immediately.
   */
  it("matches multiformats reference for a non-trivial pubkey", () => {
    const raw = new Uint8Array(32);
    for (let i = 0; i < 32; i++) raw[i] = (i * 7) & 0xff;
    expect(encodeMultikeyEd25519(raw)).toBe("z6MkeTNHUstoHASz3Q54jYAWPGMwiNF97JgneipczvRF9vLx");
  });
});

describe("buildMultiKeyIssuerDidDocument — §G overlap multi-key (Phase 2)", () => {
  function jwk(byteFill: number): IssuerActiveKey["jwk"] {
    return encodeEd25519Jwk(new Uint8Array(32).fill(byteFill));
  }

  it("emits @context with the JWK security vocab (spec §5.4.3 line 1131)", () => {
    const doc = buildMultiKeyIssuerDidDocument([
      { kid: "key-1", jwk: jwk(0x01), enabled: true },
    ]);
    expect(doc["@context"]).toEqual([
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/jwk/v1",
    ]);
  });

  it("emits one JsonWebKey2020 verificationMethod per active key, preserving order", () => {
    const doc = buildMultiKeyIssuerDidDocument([
      { kid: "key-1", jwk: jwk(0x01), enabled: false },
      { kid: "key-2", jwk: jwk(0x02), enabled: true },
    ]);
    expect(doc.verificationMethod).toHaveLength(2);
    expect(doc.verificationMethod[0]).toEqual({
      id: "did:web:api.civicship.app#key-1",
      type: "JsonWebKey2020",
      controller: "did:web:api.civicship.app",
      publicKeyJwk: jwk(0x01),
    });
    expect(doc.verificationMethod[1].id).toBe("did:web:api.civicship.app#key-2");
  });

  it("references ENABLED keys (only) from assertionMethod and authentication", () => {
    const doc = buildMultiKeyIssuerDidDocument([
      { kid: "key-1", jwk: jwk(0x01), enabled: false }, // DISABLED rotation tail
      { kid: "key-2", jwk: jwk(0x02), enabled: true },  // ENABLED — signs new VCs
    ]);
    expect(doc.assertionMethod).toEqual(["did:web:api.civicship.app#key-2"]);
    expect(doc.authentication).toEqual(["did:web:api.civicship.app#key-2"]);
  });

  it("returns empty assertionMethod when all keys are DISABLED (edge case)", () => {
    // Defensive: a fully-DISABLED state shouldn't happen in practice
    // (rotation runbook activates the new key before deactivating the
    // old), but the builder must still be lossless — it advertises zero
    // signable keys rather than fabricating one.
    const doc = buildMultiKeyIssuerDidDocument([
      { kid: "key-1", jwk: jwk(0x01), enabled: false },
    ]);
    expect(doc.assertionMethod).toEqual([]);
    expect(doc.authentication).toEqual([]);
    expect(doc.verificationMethod).toHaveLength(1);
  });

  it("throws when activeKeys is empty (caller must fall back to static stub)", () => {
    expect(() => buildMultiKeyIssuerDidDocument([])).toThrow(/at least one entry/);
  });
});

describe("encodeEd25519Jwk — RFC 8037 OKP / Ed25519", () => {
  it("encodes a 32-byte key as { kty: 'OKP', crv: 'Ed25519', x: base64url }", () => {
    const raw = new Uint8Array(32);
    for (let i = 0; i < 32; i++) raw[i] = i + 1;
    const jwk = encodeEd25519Jwk(raw);
    expect(jwk.kty).toBe("OKP");
    expect(jwk.crv).toBe("Ed25519");
    // base64url: no `+` / `/` / padding `=`.
    expect(jwk.x).not.toMatch(/[+/=]/);
    expect(jwk.x).toHaveLength(43); // ceil(32 * 4 / 3) - padding
  });

  it("produces a stable reference vector for an all-zero pubkey", () => {
    // base64url("\0" × 32) → 43 `A`s (no padding).
    expect(encodeEd25519Jwk(new Uint8Array(32)).x).toBe("A".repeat(43));
  });

  it("rejects a wrong-length raw key", () => {
    expect(() => encodeEd25519Jwk(new Uint8Array(16))).toThrow(/32 bytes/);
    expect(() => encodeEd25519Jwk(new Uint8Array(48))).toThrow(/32 bytes/);
  });
});

describe("kmsResourceNameToKid", () => {
  it("derives '#key-<n>' from a pinned cryptoKeyVersion", () => {
    expect(
      kmsResourceNameToKid(
        "projects/p/locations/global/keyRings/r/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/7",
      ),
    ).toBe("key-7");
  });

  it("throws on a missing cryptoKeyVersions suffix", () => {
    expect(() =>
      kmsResourceNameToKid("projects/p/locations/global/keyRings/r/cryptoKeys/x"),
    ).toThrow(/cryptoKeyVersions/);
  });
});

describe("base58btcEncode — direct unit checks", () => {
  it("returns empty string for empty input", () => {
    expect(base58btcEncode(new Uint8Array(0))).toBe("");
  });

  it("encodes a leading zero byte as a leading '1'", () => {
    expect(base58btcEncode(new Uint8Array([0x00]))).toBe("1");
    expect(base58btcEncode(new Uint8Array([0x00, 0x00]))).toBe("11");
  });

  it("matches well-known reference vector: 'Hello World!' → '2NEpo7TZRRrLZSi2U'", () => {
    const bytes = new TextEncoder().encode("Hello World!");
    expect(base58btcEncode(bytes)).toBe("2NEpo7TZRRrLZSi2U");
  });
});
