/**
 * Unit tests for `KmsJwtSigner` (Phase 2 KMS-backed JwtSigner — §16).
 *
 * Covers:
 *   - `alg` is the hardcoded JWS identifier `"EdDSA"`
 *   - `kid` before `prepare()` throws (fail-loud invariant)
 *   - `prepare()` snapshots the active key from `t_issuer_did_keys`
 *     → `kid` becomes `${CIVICSHIP_ISSUER_DID}#key-<n>` derived from
 *       the KMS resource name's `cryptoKeyVersions/<n>` suffix
 *   - `prepare()` is TTL-cached: second call inside TTL does NOT
 *     re-query the repository
 *   - `prepare()` refreshes after TTL expiry
 *   - `prepare()` throws when no active key is registered
 *   - `sign()` delegates to `KmsSigner.signEd25519(resourceName, payload)`
 *     and returns the base64url-encoded signature
 *   - `sign()` internally invokes `prepare()` (callers that only use
 *     `sign()` still get a refresh)
 *
 * Repository / KmsSigner / clock are injected as plain stubs so the
 * tests never touch Prisma or GCP KMS.
 */

import "reflect-metadata";

import { KmsJwtSigner } from "@/application/domain/credential/shared/kmsJwtSigner";
import { CIVICSHIP_ISSUER_DID } from "@/application/domain/credential/shared/constants";
import type { IIssuerDidKeyRepository } from "@/application/domain/credential/issuerDid/data/interface";
import type { IssuerDidKeyRow } from "@/application/domain/credential/issuerDid/data/type";
import type { KmsSigner } from "@/infrastructure/libs/kms/kmsSigner";

const KMS_KEY_V1 =
  "projects/p/locations/global/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1";
const KMS_KEY_V2 =
  "projects/p/locations/global/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/2";

function makeRow(kmsKeyResourceName: string): IssuerDidKeyRow {
  return {
    id: "key_test",
    kmsKeyResourceName,
    activatedAt: new Date("2026-01-01T00:00:00Z"),
    deactivatedAt: null,
  };
}

interface RepoStub extends IIssuerDidKeyRepository {
  findActiveKey: jest.Mock;
  listActiveKeys: jest.Mock;
}

function makeRepo(active: IssuerDidKeyRow | null): RepoStub {
  return {
    findActiveKey: jest.fn().mockResolvedValue(active),
    listActiveKeys: jest.fn().mockResolvedValue(active ? [active] : []),
  };
}

function makeKms(sigBytes: Uint8Array = new Uint8Array(64).fill(0xab)) {
  return {
    signEd25519: jest.fn().mockResolvedValue(sigBytes),
    getPublicKey: jest.fn(),
  } as unknown as jest.Mocked<KmsSigner> & {
    signEd25519: jest.Mock;
  };
}

function makeClock(initial = 1_000_000): { now: jest.Mock; advance: (ms: number) => void } {
  let t = initial;
  const now = jest.fn(() => t);
  return {
    now,
    advance(ms: number) {
      t += ms;
    },
  };
}

describe("KmsJwtSigner", () => {
  it("alg is the hardcoded EdDSA identifier", () => {
    const signer = new KmsJwtSigner(makeRepo(null), makeKms(), makeClock().now);
    expect(signer.alg).toBe("EdDSA");
  });

  it("kid before prepare() throws", () => {
    const signer = new KmsJwtSigner(makeRepo(makeRow(KMS_KEY_V1)), makeKms(), makeClock().now);
    expect(() => signer.kid).toThrow(/prepare\(\) must be awaited/);
  });

  it("prepare() snapshots the active key → kid is did:web:...#key-N", async () => {
    const repo = makeRepo(makeRow(KMS_KEY_V1));
    const signer = new KmsJwtSigner(repo, makeKms(), makeClock().now);

    await signer.prepare();

    expect(repo.findActiveKey).toHaveBeenCalledTimes(1);
    expect(signer.kid).toBe(`${CIVICSHIP_ISSUER_DID}#key-1`);
  });

  it("prepare() throws when no active key is registered", async () => {
    const signer = new KmsJwtSigner(makeRepo(null), makeKms(), makeClock().now);
    await expect(signer.prepare()).rejects.toThrow(/no active issuer key/);
  });

  it("prepare() is TTL-cached: second call inside TTL skips the repo", async () => {
    const repo = makeRepo(makeRow(KMS_KEY_V1));
    const clock = makeClock();
    const signer = new KmsJwtSigner(repo, makeKms(), clock.now);

    await signer.prepare();
    clock.advance(KmsJwtSigner.SNAPSHOT_TTL_MS - 1);
    await signer.prepare();

    expect(repo.findActiveKey).toHaveBeenCalledTimes(1);
  });

  it("prepare() refreshes after TTL expiry and picks up rotation", async () => {
    const repo = makeRepo(makeRow(KMS_KEY_V1));
    const clock = makeClock();
    const signer = new KmsJwtSigner(repo, makeKms(), clock.now);

    await signer.prepare();
    expect(signer.kid).toBe(`${CIVICSHIP_ISSUER_DID}#key-1`);

    // Operator rotates the active key.
    repo.findActiveKey.mockResolvedValue(makeRow(KMS_KEY_V2));
    clock.advance(KmsJwtSigner.SNAPSHOT_TTL_MS + 1);
    await signer.prepare();

    expect(repo.findActiveKey).toHaveBeenCalledTimes(2);
    expect(signer.kid).toBe(`${CIVICSHIP_ISSUER_DID}#key-2`);
  });

  it("sign() delegates to KmsSigner.signEd25519 with the snapshot key and returns base64url(sig)", async () => {
    const repo = makeRepo(makeRow(KMS_KEY_V1));
    // 64-byte signature whose base64url has no `=`, `+`, `/` chars so we
    // can assert against a known expected value without re-deriving it.
    const sigBytes = new Uint8Array(64);
    for (let i = 0; i < 64; i++) sigBytes[i] = i;
    const kms = makeKms(sigBytes);
    const signer = new KmsJwtSigner(repo, kms, makeClock().now);

    const signature = await signer.sign("header.payload");

    expect(kms.signEd25519).toHaveBeenCalledTimes(1);
    const [resourceName, payloadArg] = kms.signEd25519.mock.calls[0];
    expect(resourceName).toBe(KMS_KEY_V1);
    expect(payloadArg).toEqual(new TextEncoder().encode("header.payload"));

    const expected = Buffer.from(sigBytes).toString("base64url");
    expect(signature).toBe(expected);
    // Sanity: base64url has no padding / `+` / `/`.
    expect(signature).not.toMatch(/[=+/]/);
  });

  it("sign() internally calls prepare() so direct callers get a snapshot", async () => {
    const repo = makeRepo(makeRow(KMS_KEY_V1));
    const signer = new KmsJwtSigner(repo, makeKms(), makeClock().now);

    await signer.sign("h.p");

    expect(repo.findActiveKey).toHaveBeenCalledTimes(1);
    expect(signer.kid).toBe(`${CIVICSHIP_ISSUER_DID}#key-1`);
  });
});
