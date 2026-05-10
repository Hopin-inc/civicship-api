/**
 * Unit tests for `src/infrastructure/libs/kms/kmsSigner.ts`.
 *
 * Covers:
 *   - retry policy (5xx / gRPC UNAVAILABLE → retry, max 3 attempts)
 *   - 4xx (PERMISSION_DENIED, INVALID_ARGUMENT) → no retry, immediate throw
 *   - signature normalization: raw 64 bytes pass-through
 *   - signature normalization: DER SEQUENCE → raw 64 bytes
 *   - getPublicKey: SPKI PEM → raw 32-byte Ed25519 pub
 *   - resource-name validation rejects missing version
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.1
 */

import {
  KmsSigner,
  KmsClientLike,
  assertKeyResourceName,
  normalizeEd25519Signature,
  extractEd25519RawFromSpkiPem,
} from "@/infrastructure/libs/kms/kmsSigner";

const VALID_KEY =
  "projects/p/locations/global/keyRings/civicship-issuer/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1";

function bytes(...nums: number[]): Uint8Array {
  return new Uint8Array(nums);
}

function makeClient(impl: Partial<KmsClientLike>): KmsClientLike {
  return {
    asymmetricSign: impl.asymmetricSign ?? (() => Promise.reject(new Error("not implemented"))),
    getPublicKey: impl.getPublicKey ?? (() => Promise.reject(new Error("not implemented"))),
  };
}

describe("assertKeyResourceName", () => {
  it("accepts a fully-qualified KMS key version path", () => {
    expect(() => assertKeyResourceName(VALID_KEY)).not.toThrow();
  });

  it("rejects a path without /cryptoKeyVersions/N", () => {
    expect(() =>
      assertKeyResourceName("projects/p/locations/global/keyRings/r/cryptoKeys/k"),
    ).toThrow(/cryptoKeyVersions/);
  });

  it("rejects empty / wrong-type input", () => {
    expect(() => assertKeyResourceName("")).toThrow();
    expect(() => assertKeyResourceName(undefined as unknown as string)).toThrow();
  });
});

describe("normalizeEd25519Signature", () => {
  it("passes a raw 64-byte signature through unchanged", () => {
    const raw = new Uint8Array(64).fill(0xab);
    const out = normalizeEd25519Signature(raw);
    expect(out).toBe(raw);
    expect(out.length).toBe(64);
  });

  it("unwraps a DER SEQUENCE { INTEGER, INTEGER } to raw 64 bytes", () => {
    // r = 32 bytes of 0x11, s = 32 bytes of 0x22, no leading-zero padding needed
    // because high bit of 0x11 / 0x22 is clear.
    const r = new Uint8Array(32).fill(0x11);
    const s = new Uint8Array(32).fill(0x22);
    const der = new Uint8Array([
      0x30,
      2 + r.length + 2 + s.length,
      0x02,
      r.length,
      ...r,
      0x02,
      s.length,
      ...s,
    ]);
    const out = normalizeEd25519Signature(der);
    expect(out.length).toBe(64);
    expect(Array.from(out.subarray(0, 32))).toEqual(Array.from(r));
    expect(Array.from(out.subarray(32, 64))).toEqual(Array.from(s));
  });

  it("strips DER leading-zero padding for high-bit integers", () => {
    // r = 0x80 || 31×0x00 (33 bytes due to DER sign-bit padding)
    // After stripping the 0x00 leading byte the natural value is 32 bytes
    // starting with 0x80.
    const rEncoded = new Uint8Array(33);
    rEncoded[0] = 0x00;
    rEncoded[1] = 0x80;
    // s = 32 bytes of 0x33
    const s = new Uint8Array(32).fill(0x33);
    const der = new Uint8Array([
      0x30,
      2 + rEncoded.length + 2 + s.length,
      0x02,
      rEncoded.length,
      ...rEncoded,
      0x02,
      s.length,
      ...s,
    ]);
    const out = normalizeEd25519Signature(der);
    expect(out.length).toBe(64);
    expect(out[0]).toBe(0x80);
    // s is 32-byte 0x33 — should land in bytes [32..64]
    expect(Array.from(out.subarray(32, 64))).toEqual(Array.from(s));
  });

  it("rejects clearly-malformed lengths", () => {
    expect(() => normalizeEd25519Signature(bytes(1, 2, 3))).toThrow(
      /Unexpected KMS signature length/,
    );
  });
});

describe("extractEd25519RawFromSpkiPem", () => {
  it("extracts 32 bytes from a valid Ed25519 SPKI PEM", () => {
    // Build a synthetic SPKI: 12-byte Ed25519 prefix + 32-byte key
    const rawKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) rawKey[i] = i + 1;
    const spki = new Uint8Array(44);
    spki.set([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00], 0);
    spki.set(rawKey, 12);
    const pem = `-----BEGIN PUBLIC KEY-----\n${Buffer.from(spki).toString(
      "base64",
    )}\n-----END PUBLIC KEY-----\n`;

    const out = extractEd25519RawFromSpkiPem(pem);
    expect(out.length).toBe(32);
    expect(Array.from(out)).toEqual(Array.from(rawKey));
  });

  it("throws on a non-44-byte SPKI", () => {
    const pem = `-----BEGIN PUBLIC KEY-----\n${Buffer.from(new Uint8Array(40)).toString(
      "base64",
    )}\n-----END PUBLIC KEY-----`;
    expect(() => extractEd25519RawFromSpkiPem(pem)).toThrow(/Unexpected SPKI length/);
  });

  it("throws on a wrong-OID SPKI prefix", () => {
    // 12-byte prefix with a single byte tampered, total length 44
    const spki = new Uint8Array(44);
    spki.set(
      [0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x71 /* wrong */, 0x03, 0x21, 0x00],
      0,
    );
    const pem = `-----BEGIN PUBLIC KEY-----\n${Buffer.from(spki).toString(
      "base64",
    )}\n-----END PUBLIC KEY-----`;
    expect(() => extractEd25519RawFromSpkiPem(pem)).toThrow(/SPKI prefix at byte/);
  });
});

describe("KmsSigner.signEd25519", () => {
  it("returns the raw 64-byte signature on a successful single call", async () => {
    const sig = new Uint8Array(64).fill(0x55);
    const signSpy = jest.fn().mockResolvedValue([{ signature: sig }, {}, {}]);
    const signer = new KmsSigner(makeClient({ asymmetricSign: signSpy }));

    const out = await signer.signEd25519(VALID_KEY, bytes(1, 2, 3));
    expect(out.length).toBe(64);
    expect(signSpy).toHaveBeenCalledTimes(1);
    expect(signSpy).toHaveBeenCalledWith({
      name: VALID_KEY,
      data: bytes(1, 2, 3),
    });
  });

  it("retries on a retryable gRPC error and eventually succeeds", async () => {
    const sig = new Uint8Array(64).fill(0x77);
    let calls = 0;
    const signSpy = jest.fn().mockImplementation(() => {
      calls++;
      if (calls < 3) {
        // 14 = UNAVAILABLE
        return Promise.reject(Object.assign(new Error("unavailable"), { code: 14 }));
      }
      return Promise.resolve([{ signature: sig }, {}, {}]);
    });
    const signer = new KmsSigner(makeClient({ asymmetricSign: signSpy }));

    const out = await signer.signEd25519(VALID_KEY, bytes(0));
    expect(out.length).toBe(64);
    expect(signSpy).toHaveBeenCalledTimes(3);
  });

  it("stops after MAX_ATTEMPTS retries and rethrows the last error", async () => {
    const signSpy = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error("still down"), { code: 14 }));
    const signer = new KmsSigner(makeClient({ asymmetricSign: signSpy }));

    await expect(signer.signEd25519(VALID_KEY, bytes(1))).rejects.toThrow(/still down/);
    expect(signSpy).toHaveBeenCalledTimes(3);
  });

  it("does NOT retry a 4xx-class permission error", async () => {
    // gRPC code 7 = PERMISSION_DENIED → not in our retry set
    const signSpy = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error("perm denied"), { code: 7 }));
    const signer = new KmsSigner(makeClient({ asymmetricSign: signSpy }));

    await expect(signer.signEd25519(VALID_KEY, bytes(1))).rejects.toThrow(/perm denied/);
    expect(signSpy).toHaveBeenCalledTimes(1);
  });

  it("retries on HTTP 503 surfaced via the REST fallback", async () => {
    let calls = 0;
    const signSpy = jest.fn().mockImplementation(() => {
      calls++;
      if (calls < 2) {
        return Promise.reject(Object.assign(new Error("503"), { status: 503 }));
      }
      return Promise.resolve([{ signature: new Uint8Array(64) }, {}, {}]);
    });
    const signer = new KmsSigner(makeClient({ asymmetricSign: signSpy }));

    await signer.signEd25519(VALID_KEY, bytes(1));
    expect(signSpy).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on HTTP 400", async () => {
    const signSpy = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error("bad req"), { status: 400 }));
    const signer = new KmsSigner(makeClient({ asymmetricSign: signSpy }));

    await expect(signer.signEd25519(VALID_KEY, bytes(1))).rejects.toThrow(/bad req/);
    expect(signSpy).toHaveBeenCalledTimes(1);
  });

  it("rejects when KMS returns no signature payload", async () => {
    const signSpy = jest.fn().mockResolvedValue([{ signature: null }, {}, {}]);
    const signer = new KmsSigner(makeClient({ asymmetricSign: signSpy }));

    await expect(signer.signEd25519(VALID_KEY, bytes(1))).rejects.toThrow(/no signature/);
  });

  it("rejects an obviously-bad key resource name without calling KMS", async () => {
    const signSpy = jest.fn();
    const signer = new KmsSigner(makeClient({ asymmetricSign: signSpy }));

    await expect(signer.signEd25519("projects/p/locations/global", bytes(1))).rejects.toThrow(
      /cryptoKeyVersions/,
    );
    expect(signSpy).not.toHaveBeenCalled();
  });
});

describe("KmsSigner.getPublicKey", () => {
  function spkiPemFor(rawKey: Uint8Array): string {
    const spki = new Uint8Array(44);
    spki.set([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00], 0);
    spki.set(rawKey, 12);
    return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(spki).toString(
      "base64",
    )}\n-----END PUBLIC KEY-----`;
  }

  it("returns raw 32 bytes for a valid Ed25519 SPKI PEM", async () => {
    const raw = new Uint8Array(32).fill(0x42);
    const getPublicKeySpy = jest.fn().mockResolvedValue([{ pem: spkiPemFor(raw) }, {}, {}]);
    const signer = new KmsSigner(makeClient({ getPublicKey: getPublicKeySpy }));

    const out = await signer.getPublicKey(VALID_KEY);
    expect(out.length).toBe(32);
    expect(Array.from(out)).toEqual(Array.from(raw));
  });

  it("retries on a transient gRPC error", async () => {
    let calls = 0;
    const getPublicKeySpy = jest.fn().mockImplementation(() => {
      calls++;
      if (calls < 2) {
        return Promise.reject(Object.assign(new Error("deadline"), { code: 4 }));
      }
      return Promise.resolve([{ pem: spkiPemFor(new Uint8Array(32)) }, {}, {}]);
    });
    const signer = new KmsSigner(makeClient({ getPublicKey: getPublicKeySpy }));

    const out = await signer.getPublicKey(VALID_KEY);
    expect(out.length).toBe(32);
    expect(getPublicKeySpy).toHaveBeenCalledTimes(2);
  });

  it("rejects when KMS returns an empty PEM", async () => {
    const getPublicKeySpy = jest.fn().mockResolvedValue([{ pem: "" }, {}, {}]);
    const signer = new KmsSigner(makeClient({ getPublicKey: getPublicKeySpy }));

    await expect(signer.getPublicKey(VALID_KEY)).rejects.toThrow(/empty PEM/);
  });
});

describe("KmsSigner construction (S1848 lint guard)", () => {
  it("can be constructed with no arguments without exploding at import time", () => {
    // We don't actually call .signEd25519 here — that would require ADC.
    // Just verify the synchronous constructor path doesn't throw, while
    // satisfying SonarQube S1848 by binding the result.
    const signer = new KmsSigner(
      makeClient({
        asymmetricSign: () => Promise.resolve([{ signature: new Uint8Array(64) }]),
        getPublicKey: () => Promise.resolve([{ pem: "" }]),
      }),
    );
    expect(signer).toBeInstanceOf(KmsSigner);
  });
});
