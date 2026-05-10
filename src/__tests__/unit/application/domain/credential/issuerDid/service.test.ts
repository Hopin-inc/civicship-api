/**
 * Unit tests for `IssuerDidService` (§5.4.3).
 *
 * Covers:
 *   - `getActiveIssuerDid()`        → constant, sync, no I/O
 *   - `getActiveIssuerDidDocument()`
 *       - active key present → builds full Document via IssuerDidBuilder
 *       - active key absent  → returns null (router-side fallback)
 *       - public-key cache TTL → second call within TTL skips KMS
 *       - public-key cache TTL → second call after TTL refetches KMS
 *       - distinct resource names cached independently
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
