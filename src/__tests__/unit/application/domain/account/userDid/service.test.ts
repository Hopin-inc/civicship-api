/**
 * Unit tests for `UserDidService` (Phase 1 step 7).
 *
 * Strategy A: the repository is a stub but tests inject a `useValue` mock
 * so we can assert the call shape. The service's pure encoding /
 * hashing path is exercised end-to-end — only persistence is mocked.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { decode as cborDecode } from "cbor-x";
import { blake2b } from "@noble/hashes/blake2b";
import { bytesToHex } from "@noble/hashes/utils";
import UserDidService from "@/application/domain/account/userDid/service";
import { IContext } from "@/types/server";
import {
  buildDeactivatedDidDocument,
  buildMinimalDidDocument,
  buildUserDid,
} from "@/infrastructure/libs/did/userDidBuilder";

const VALID_USER_ID = "u_xyz_phase1";
const SAMPLE_NETWORK = "CARDANO_PREPROD" as const;

class MockUserDidAnchorRepository {
  findLatestByUserId = jest.fn().mockResolvedValue(null);
  createCreate = jest.fn();
  createUpdate = jest.fn();
  createDeactivate = jest.fn();
}

describe("UserDidService", () => {
  let mockRepository: MockUserDidAnchorRepository;
  let service: UserDidService;
  const mockCtx = {} as IContext;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockUserDidAnchorRepository();
    container.register("UserDidAnchorRepository", { useValue: mockRepository });
    container.register("UserDidService", { useClass: UserDidService });

    service = container.resolve(UserDidService);
  });

  describe("createDidForUser", () => {
    it("builds did:web string + minimal Document and persists with Blake2b-256 hash", async () => {
      mockRepository.createCreate.mockResolvedValue({ ok: true });

      await service.createDidForUser(mockCtx, VALID_USER_ID);

      expect(mockRepository.createCreate).toHaveBeenCalledTimes(1);
      const [ctxArg, input, txArg] = mockRepository.createCreate.mock.calls[0];

      expect(ctxArg).toBe(mockCtx);
      expect(txArg).toBeUndefined();
      expect(input.userId).toBe(VALID_USER_ID);
      expect(input.did).toBe(buildUserDid(VALID_USER_ID));
      // Default network falls back to mainnet per §4.1.
      expect(input.network).toBe("CARDANO_MAINNET");

      // documentHash is 64 hex chars (32 bytes) of Blake2b-256 over the
      // CBOR-encoded minimal Document.
      expect(input.documentHash).toMatch(/^[0-9a-f]{64}$/);
      expect(input.documentCbor).toBeInstanceOf(Uint8Array);

      // Round-trip: decoded CBOR matches the minimal Document exactly.
      const decoded = cborDecode(input.documentCbor as Uint8Array);
      expect(decoded).toEqual(buildMinimalDidDocument(VALID_USER_ID));

      // Hash matches manually-computed Blake2b-256 of the same bytes.
      const recomputed = bytesToHex(blake2b(input.documentCbor as Uint8Array, { dkLen: 32 }));
      expect(input.documentHash).toBe(recomputed);
    });

    it("forwards the supplied tx to the repository", async () => {
      mockRepository.createCreate.mockResolvedValue({ ok: true });
      const fakeTx = { sentinel: true } as never;

      await service.createDidForUser(mockCtx, VALID_USER_ID, fakeTx);

      expect(mockRepository.createCreate).toHaveBeenCalledTimes(1);
      const [, , txArg] = mockRepository.createCreate.mock.calls[0];
      expect(txArg).toBe(fakeTx);
    });

    it("propagates the supplied network", async () => {
      mockRepository.createCreate.mockResolvedValue({ ok: true });

      await service.createDidForUser(mockCtx, VALID_USER_ID, undefined, SAMPLE_NETWORK);

      const [, input] = mockRepository.createCreate.mock.calls[0];
      expect(input.network).toBe(SAMPLE_NETWORK);
    });

    it("rejects userIds that violate the §9.2 regex", async () => {
      // `assertValidUserId` (called by `buildUserDid`) throws on uppercase / colons.
      await expect(service.createDidForUser(mockCtx, "BAD:ID")).rejects.toThrow(/§9\.2/);
      expect(mockRepository.createCreate).not.toHaveBeenCalled();
    });
  });

  describe("updateDid", () => {
    it("re-anchors the minimal Document via createUpdate", async () => {
      mockRepository.createUpdate.mockResolvedValue({ ok: true });

      await service.updateDid(mockCtx, VALID_USER_ID);

      expect(mockRepository.createUpdate).toHaveBeenCalledTimes(1);
      expect(mockRepository.createCreate).not.toHaveBeenCalled();
      const [, input] = mockRepository.createUpdate.mock.calls[0];
      expect(input.did).toBe(buildUserDid(VALID_USER_ID));
      expect(input.documentCbor).toBeInstanceOf(Uint8Array);

      // CBOR shape parity with createDidForUser (Phase 1 only re-anchors
      // the minimal document — see §B / §10.1.3 future work note).
      const decoded = cborDecode(input.documentCbor as Uint8Array);
      expect(decoded).toEqual(buildMinimalDidDocument(VALID_USER_ID));
    });
  });

  describe("deactivateDid", () => {
    it("hashes the tombstone Document and emits createDeactivate without CBOR", async () => {
      mockRepository.createDeactivate.mockResolvedValue({ ok: true });

      await service.deactivateDid(mockCtx, VALID_USER_ID);

      expect(mockRepository.createDeactivate).toHaveBeenCalledTimes(1);
      const [, input] = mockRepository.createDeactivate.mock.calls[0];
      expect(input.userId).toBe(VALID_USER_ID);
      expect(input.did).toBe(buildUserDid(VALID_USER_ID));
      // §E: tombstone CBOR is null on chain — resolver reconstructs it.
      expect((input as { documentCbor?: unknown }).documentCbor).toBeUndefined();

      // documentHash references the canonical tombstone shape so verifiers
      // can reproduce it offline.
      const tombstoneCbor = (await import("cbor-x")).encode(
        buildDeactivatedDidDocument(VALID_USER_ID),
      );
      const tombstoneBytes =
        tombstoneCbor instanceof Uint8Array ? tombstoneCbor : new Uint8Array(tombstoneCbor);
      const expectedHash = bytesToHex(blake2b(tombstoneBytes, { dkLen: 32 }));
      expect(input.documentHash).toBe(expectedHash);
    });
  });
});
