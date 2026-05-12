/**
 * Unit tests for `IssuerDidService` (§5.4.3).
 *
 * Covers:
 *   - `getActiveIssuerDid()`        → constant, sync, no I/O
 *   - `getActiveIssuerDidDocument()` (Phase 1, single-active-key)
 *       - active key present → builds full Document via IssuerDidBuilder
 *       - active key absent  → returns null (router-side fallback)
 *       - public-key cache TTL → second call within TTL skips KMS
 *       - public-key cache TTL → second call after TTL refetches KMS
 *       - distinct resource names cached independently
 *   - `buildDidDocument()` (Phase 2 §G overlap multi-key, spec §5.4.3)
 *       - 1 ENABLED + 1 DISABLED → 2 verificationMethod, 1 assertionMethod
 *       - empty repository       → returns null (bootstrap)
 *       - JWK shape (kty/crv/x)  → matches RFC 8037 OKP / Ed25519
 *       - ordering preserved from listActiveKeys
 *       - assertionMethod / authentication contain only ENABLED rows
 *   - `signWithActiveKey()`
 *       - active key present → delegates to KmsSigner.signEd25519
 *       - active key absent  → throws (no fallback for signing)
 *
 * Repository and KmsSigner are stubbed via plain object literals so the
 * tests never touch Prisma or GCP KMS. Time is injected via the optional
 * `now` constructor argument so TTL assertions are deterministic.
 */

import "reflect-metadata";

import IssuerDidService, {
  PUBLIC_KEY_TTL_MS,
} from "@/application/domain/credential/issuerDid/service";
import type { IIssuerDidKeyRepository } from "@/application/domain/credential/issuerDid/data/interface";
import type { IssuerDidKeyRow } from "@/application/domain/credential/issuerDid/data/type";
import type { KmsSigner } from "@/infrastructure/libs/kms/kmsSigner";

const KMS_KEY_RESOURCE =
  "projects/civicship-prd/locations/global/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1";
const KMS_KEY_RESOURCE_V2 =
  "projects/civicship-prd/locations/global/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/2";

// 32-byte all-zero public key — valid Ed25519 length, easy to assert.
const ZERO_PUBKEY = new Uint8Array(32);
// Distinct second key for cache-isolation tests; raw bytes 0x01..0x20.
const ALT_PUBKEY = new Uint8Array(32);
for (let i = 0; i < 32; i++) ALT_PUBKEY[i] = i + 1;

function makeRow(overrides: Partial<IssuerDidKeyRow> = {}): IssuerDidKeyRow {
  return {
    id: "key_test_1",
    kmsKeyResourceName: KMS_KEY_RESOURCE,
    activatedAt: new Date("2026-01-01T00:00:00Z"),
    deactivatedAt: null,
    ...overrides,
  };
}

interface RepoStub extends IIssuerDidKeyRepository {
  findActiveKey: jest.Mock;
  listActiveKeys: jest.Mock;
}

interface SignerStub {
  signEd25519: jest.Mock;
  getPublicKey: jest.Mock;
}

function makeRepo(activeRow: IssuerDidKeyRow | null): RepoStub {
  return {
    findActiveKey: jest.fn().mockResolvedValue(activeRow),
    listActiveKeys: jest.fn().mockResolvedValue(activeRow ? [activeRow] : []),
  };
}

function makeSigner(): SignerStub {
  return {
    signEd25519: jest.fn().mockResolvedValue(new Uint8Array(64)),
    getPublicKey: jest.fn().mockResolvedValue(ZERO_PUBKEY),
  };
}

/**
 * Construct an `IssuerDidService` directly with stubs. We avoid going
 * through `container.resolve` here so the tests pin *exactly* the
 * dependencies under test — DI smoke-testing belongs in a separate
 * provider-level test, not at the service granularity.
 */
function buildService(opts: {
  repo: IIssuerDidKeyRepository;
  signer: SignerStub;
  now?: () => number;
}): IssuerDidService {
  return new IssuerDidService(opts.repo, opts.signer as unknown as KmsSigner, opts.now);
}

describe("IssuerDidService", () => {
  describe("getActiveIssuerDid", () => {
    it("returns the canonical did:web:api.civicship.app constant", () => {
      const svc = buildService({ repo: makeRepo(null), signer: makeSigner() });
      expect(svc.getActiveIssuerDid()).toBe("did:web:api.civicship.app");
    });

    it("does not touch the repository or KMS", () => {
      const repo = makeRepo(makeRow());
      const signer = makeSigner();
      const svc = buildService({ repo, signer });

      svc.getActiveIssuerDid();

      expect(repo.findActiveKey).not.toHaveBeenCalled();
      expect(signer.getPublicKey).not.toHaveBeenCalled();
    });
  });

  describe("getActiveIssuerDidDocument — active key present", () => {
    it("returns a full Issuer DID Document built via IssuerDidBuilder", async () => {
      const repo = makeRepo(makeRow());
      const signer = makeSigner();
      const svc = buildService({ repo, signer });

      const doc = await svc.getActiveIssuerDidDocument();

      expect(doc).not.toBeNull();
      expect(doc!.id).toBe("did:web:api.civicship.app");
      // Fragment derives from cryptoKeyVersions/<n> (§5.1.2).
      expect(doc!.verificationMethod[0].id).toBe("did:web:api.civicship.app#key-1");
      expect(doc!.verificationMethod[0].type).toBe("Multikey");
      expect(doc!.verificationMethod[0].controller).toBe("did:web:api.civicship.app");
      // Multibase prefix `z` for base58btc (W3C Multikey).
      expect(doc!.verificationMethod[0].publicKeyMultibase.startsWith("z")).toBe(true);
      expect(doc!.assertionMethod[0]).toBe("did:web:api.civicship.app#key-1");
    });

    it("calls KmsSigner.getPublicKey with the active row's resource name", async () => {
      const repo = makeRepo(makeRow());
      const signer = makeSigner();
      const svc = buildService({ repo, signer });

      await svc.getActiveIssuerDidDocument();

      expect(signer.getPublicKey).toHaveBeenCalledWith(KMS_KEY_RESOURCE);
    });
  });

  describe("getActiveIssuerDidDocument — active key absent", () => {
    it("returns null without invoking KMS", async () => {
      const repo = makeRepo(null);
      const signer = makeSigner();
      const svc = buildService({ repo, signer });

      const doc = await svc.getActiveIssuerDidDocument();

      expect(doc).toBeNull();
      expect(signer.getPublicKey).not.toHaveBeenCalled();
    });
  });

  describe("getActiveIssuerDidDocument — public-key cache TTL", () => {
    it("does not call KMS twice within the TTL window", async () => {
      const repo = makeRepo(makeRow());
      const signer = makeSigner();
      // Frozen clock: every call sees the same `now`.
      const svc = buildService({ repo, signer, now: () => 1_000_000 });

      await svc.getActiveIssuerDidDocument();
      await svc.getActiveIssuerDidDocument();

      expect(signer.getPublicKey).toHaveBeenCalledTimes(1);
    });

    it("refetches the public key after the TTL elapses", async () => {
      const repo = makeRepo(makeRow());
      const signer = makeSigner();
      let now = 1_000_000;
      const svc = buildService({ repo, signer, now: () => now });

      await svc.getActiveIssuerDidDocument();
      // Advance just past the TTL boundary.
      now += PUBLIC_KEY_TTL_MS + 1;
      await svc.getActiveIssuerDidDocument();

      expect(signer.getPublicKey).toHaveBeenCalledTimes(2);
    });

    it("caches independently per KMS resource name (§G overlap)", async () => {
      // Repo flips the active row between calls — simulates a §G rotation
      // where the active key advances mid-session.
      const rowV1 = makeRow({ kmsKeyResourceName: KMS_KEY_RESOURCE });
      const rowV2 = makeRow({ kmsKeyResourceName: KMS_KEY_RESOURCE_V2, id: "key_test_2" });
      const repo: RepoStub = {
        findActiveKey: jest
          .fn()
          .mockResolvedValueOnce(rowV1)
          .mockResolvedValueOnce(rowV2)
          .mockResolvedValueOnce(rowV1),
        listActiveKeys: jest.fn().mockResolvedValue([rowV1, rowV2]),
      };
      const signer: SignerStub = {
        signEd25519: jest.fn(),
        // First two calls return distinct keys; the third call (post-cache)
        // should never reach this mock because v1 is cached from call #1.
        getPublicKey: jest
          .fn()
          .mockResolvedValueOnce(ZERO_PUBKEY)
          .mockResolvedValueOnce(ALT_PUBKEY)
          .mockRejectedValueOnce(new Error("should not reach KMS for cached v1")),
      };
      const svc = buildService({ repo, signer, now: () => 1_000_000 });

      await svc.getActiveIssuerDidDocument(); // v1 → KMS hit, cached
      await svc.getActiveIssuerDidDocument(); // v2 → KMS hit (different cache key)
      await svc.getActiveIssuerDidDocument(); // v1 again → cache hit, no KMS

      expect(signer.getPublicKey).toHaveBeenCalledTimes(2);
      expect(signer.getPublicKey).toHaveBeenNthCalledWith(1, KMS_KEY_RESOURCE);
      expect(signer.getPublicKey).toHaveBeenNthCalledWith(2, KMS_KEY_RESOURCE_V2);
    });
  });

  describe("buildDidDocument — §G overlap multi-key (Phase 2)", () => {
    it("emits one verificationMethod per row (ENABLED + DISABLED) and ENABLED-only assertionMethod", async () => {
      // Scenario: a rotation in progress. v2 is the new ENABLED key
      // (assertionMethod target), v1 is DISABLED but still published in
      // verificationMethod so verifiers can validate VCs signed with v1
      // (design §9.1.3 — DISABLED retained forever, never DESTROYED).
      const rowV1Disabled = makeRow({
        id: "key_v1",
        kmsKeyResourceName: KMS_KEY_RESOURCE,
        deactivatedAt: new Date("2026-06-01T00:00:00Z"),
      });
      const rowV2Enabled = makeRow({
        id: "key_v2",
        kmsKeyResourceName: KMS_KEY_RESOURCE_V2,
        activatedAt: new Date("2026-06-01T00:00:00Z"),
        deactivatedAt: null,
      });
      const repo: RepoStub = {
        findActiveKey: jest.fn().mockResolvedValue(rowV2Enabled),
        // Repository contract: ordered by activatedAt ASC. Older
        // (DISABLED) row first, newer (ENABLED) row last.
        listActiveKeys: jest.fn().mockResolvedValue([rowV1Disabled, rowV2Enabled]),
      };
      const signer: SignerStub = {
        signEd25519: jest.fn(),
        // v1 returns ZERO_PUBKEY, v2 returns ALT_PUBKEY — distinct bytes
        // so the test can verify the JWK `x` differs per row.
        getPublicKey: jest
          .fn()
          .mockImplementation((name: string) =>
            name === KMS_KEY_RESOURCE
              ? Promise.resolve(ZERO_PUBKEY)
              : Promise.resolve(ALT_PUBKEY),
          ),
      };
      const svc = buildService({ repo, signer });

      const doc = await svc.buildDidDocument();

      expect(doc).not.toBeNull();
      expect(doc!.id).toBe("did:web:api.civicship.app");

      // verificationMethod: both keys (DISABLED v1 first per listActiveKeys order)
      expect(doc!.verificationMethod).toHaveLength(2);
      expect(doc!.verificationMethod[0].id).toBe("did:web:api.civicship.app#key-1");
      expect(doc!.verificationMethod[0].type).toBe("JsonWebKey2020");
      expect(doc!.verificationMethod[0].controller).toBe("did:web:api.civicship.app");
      expect(doc!.verificationMethod[0].publicKeyJwk.kty).toBe("OKP");
      expect(doc!.verificationMethod[0].publicKeyJwk.crv).toBe("Ed25519");
      expect(doc!.verificationMethod[1].id).toBe("did:web:api.civicship.app#key-2");

      // assertionMethod / authentication: ENABLED only (§9.1.2)
      expect(doc!.assertionMethod).toEqual(["did:web:api.civicship.app#key-2"]);
      expect(doc!.authentication).toEqual(["did:web:api.civicship.app#key-2"]);

      // DISABLED key MUST NOT appear in assertionMethod (signs == false)
      expect(doc!.assertionMethod).not.toContain("did:web:api.civicship.app#key-1");
    });

    it("returns null when no keys are registered (bootstrap state)", async () => {
      const repo: RepoStub = {
        findActiveKey: jest.fn().mockResolvedValue(null),
        listActiveKeys: jest.fn().mockResolvedValue([]),
      };
      const signer = makeSigner();
      const svc = buildService({ repo, signer });

      const doc = await svc.buildDidDocument();

      expect(doc).toBeNull();
      // No KMS roundtrip when the repo says "no keys".
      expect(signer.getPublicKey).not.toHaveBeenCalled();
    });

    it("encodes the public-key JWK as RFC 8037 Ed25519 OKP (kty/crv/x)", async () => {
      const row = makeRow({ kmsKeyResourceName: KMS_KEY_RESOURCE });
      const repo: RepoStub = {
        findActiveKey: jest.fn().mockResolvedValue(row),
        listActiveKeys: jest.fn().mockResolvedValue([row]),
      };
      // Use ALT_PUBKEY (bytes 1..32) so the base64url result has
      // non-trivial characters (catches a `+` / `-` swap regression).
      const signer: SignerStub = {
        signEd25519: jest.fn(),
        getPublicKey: jest.fn().mockResolvedValue(ALT_PUBKEY),
      };
      const svc = buildService({ repo, signer });

      const doc = await svc.buildDidDocument();

      expect(doc).not.toBeNull();
      const jwk = doc!.verificationMethod[0].publicKeyJwk;
      expect(jwk.kty).toBe("OKP");
      expect(jwk.crv).toBe("Ed25519");
      // base64url: no padding (`=`), `-` / `_` instead of `+` / `/`.
      expect(jwk.x).not.toMatch(/[+/=]/);
      // Length: ceil(32 / 3) * 4 = 44, minus 1 byte padding tail → 43.
      expect(jwk.x).toHaveLength(43);
    });

    it("uses the @context that includes the JWK security vocab", async () => {
      const row = makeRow();
      const repo: RepoStub = {
        findActiveKey: jest.fn().mockResolvedValue(row),
        listActiveKeys: jest.fn().mockResolvedValue([row]),
      };
      const signer = makeSigner();
      const svc = buildService({ repo, signer });

      const doc = await svc.buildDidDocument();

      expect(doc!["@context"]).toEqual([
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/jwk/v1",
      ]);
    });

    it("treats deactivatedAt === null as ENABLED and a Date as DISABLED", async () => {
      // Two ENABLED rows — both must appear in assertionMethod.
      const rowA = makeRow({
        id: "a",
        kmsKeyResourceName: KMS_KEY_RESOURCE,
        deactivatedAt: null,
      });
      const rowB = makeRow({
        id: "b",
        kmsKeyResourceName: KMS_KEY_RESOURCE_V2,
        deactivatedAt: null,
      });
      const repo: RepoStub = {
        findActiveKey: jest.fn().mockResolvedValue(rowA),
        listActiveKeys: jest.fn().mockResolvedValue([rowA, rowB]),
      };
      const signer: SignerStub = {
        signEd25519: jest.fn(),
        getPublicKey: jest
          .fn()
          .mockImplementation((name: string) =>
            name === KMS_KEY_RESOURCE
              ? Promise.resolve(ZERO_PUBKEY)
              : Promise.resolve(ALT_PUBKEY),
          ),
      };
      const svc = buildService({ repo, signer });

      const doc = await svc.buildDidDocument();

      expect(doc!.assertionMethod).toEqual([
        "did:web:api.civicship.app#key-1",
        "did:web:api.civicship.app#key-2",
      ]);
      expect(doc!.authentication).toEqual(doc!.assertionMethod);
    });

    it("reuses the public-key TTL cache across single-key and multi-key paths", async () => {
      // Calling getActiveIssuerDidDocument first should populate the
      // cache so buildDidDocument's later read does not re-hit KMS for
      // the same resource name. Same-process consistency: the cache is
      // intentionally per-resource-name (not per-method).
      const row = makeRow({ kmsKeyResourceName: KMS_KEY_RESOURCE });
      const repo: RepoStub = {
        findActiveKey: jest.fn().mockResolvedValue(row),
        listActiveKeys: jest.fn().mockResolvedValue([row]),
      };
      const signer = makeSigner();
      const svc = buildService({ repo, signer, now: () => 1_000_000 });

      await svc.getActiveIssuerDidDocument();
      await svc.buildDidDocument();

      // One KMS call total — the second read hits the TTL cache.
      expect(signer.getPublicKey).toHaveBeenCalledTimes(1);
    });
  });

  describe("signWithActiveKey", () => {
    it("delegates to KmsSigner.signEd25519 with the active resource name", async () => {
      const repo = makeRepo(makeRow());
      const signer = makeSigner();
      const expectedSig = new Uint8Array(64);
      expectedSig[0] = 0xab;
      signer.signEd25519.mockResolvedValueOnce(expectedSig);
      const svc = buildService({ repo, signer });

      const payload = new Uint8Array([1, 2, 3]);
      const sig = await svc.signWithActiveKey(payload);

      expect(signer.signEd25519).toHaveBeenCalledWith(KMS_KEY_RESOURCE, payload);
      expect(sig).toBe(expectedSig);
    });

    it("throws when no active key is registered (no fallback for signing)", async () => {
      const repo = makeRepo(null);
      const signer = makeSigner();
      const svc = buildService({ repo, signer });

      await expect(svc.signWithActiveKey(new Uint8Array([1]))).rejects.toThrow(
        /no active issuer key registered/i,
      );
      expect(signer.signEd25519).not.toHaveBeenCalled();
    });
  });
});
