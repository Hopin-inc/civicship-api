/**
 * Unit tests for `src/infrastructure/libs/did/didDocumentResolver.ts`.
 *
 * Covers:
 *   - CONFIRMED anchor → Document with `proof.anchorStatus = "confirmed"`
 *     and a real cardanoscan URL (§5.4.4)
 *   - PENDING anchor → Document with `proof.anchorStatus = "pending"`,
 *     `anchorTxHash = null`, `verificationUrl = null` (§F)
 *   - DEACTIVATE op latest → Tombstone Document with `deactivated: true`
 *     served at HTTP 200 by the caller (§E)
 *   - No anchor for the user → `null` (caller maps to 404)
 *   - `documentCbor` decoding restores the on-chain document; corrupt blob
 *     falls back to the minimal `{ @context, id }` form (§B / §3.3)
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.4
 *   docs/report/did-vc-internalization.md §5.4.4 §B §C §E §F
 */

import "reflect-metadata";

import { encode as cborEncode } from "cbor-x";
import {
  DidDocumentResolver,
  type UserDidAnchorRow,
  type UserDidAnchorStore,
} from "@/infrastructure/libs/did/didDocumentResolver";

const USER_ID = "u_alice";
const USER_DID = "did:web:api.civicship.app:users:u_alice";
const TX_HASH = "a".repeat(64);
const DOC_HASH = "b".repeat(64);

function buildStore(row: UserDidAnchorRow | null): UserDidAnchorStore {
  return {
    findLatestByUserId: jest.fn().mockResolvedValue(row),
  };
}

function buildAnchor(overrides: Partial<UserDidAnchorRow> = {}): UserDidAnchorRow {
  // The resolver only inspects a subset of `UserDidAnchor` columns (see
  // `buildProof`), but `UserDidAnchorRow = UserDidAnchor` post-Strategy-A,
  // so the factory has to supply every required field.
  return {
    id: "uda_phase1_test",
    did: USER_DID,
    operation: "CREATE",
    documentHash: DOC_HASH,
    documentCbor: null,
    previousAnchorId: null,
    network: "CARDANO_MAINNET",
    metadataLabel: 1985,
    chainTxHash: TX_HASH,
    chainOpIndex: 0,
    status: "CONFIRMED",
    submittedAt: null,
    confirmedAt: new Date("2026-01-15T12:00:00.000Z"),
    batchId: null,
    version: 0,
    userId: "u_alice",
    createdAt: new Date("2026-01-15T11:50:00.000Z"),
    updatedAt: null,
    ...overrides,
  };
}

describe("DidDocumentResolver", () => {
  it("returns null when the user has no anchor row", async () => {
    const store = buildStore(null);
    const resolver = new DidDocumentResolver(store);

    const result = await resolver.buildDidDocument(USER_ID);
    expect(result).toBeNull();
    expect(store.findLatestByUserId).toHaveBeenCalledWith(USER_ID);
  });

  describe("CONFIRMED anchor (§5.4.4)", () => {
    it("returns a minimal document with confirmed proof and explorer URL", async () => {
      const resolver = new DidDocumentResolver(buildStore(buildAnchor()));
      const doc = await resolver.buildDidDocument(USER_ID);

      expect(doc).not.toBeNull();
      expect(doc).toMatchObject({
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: USER_DID,
        proof: {
          type: "DataIntegrityProof",
          cryptosuite: "civicship-merkle-anchor-2026",
          anchorChain: "cardano:mainnet",
          anchorTxHash: TX_HASH,
          opIndexInTx: 0,
          docHash: DOC_HASH,
          anchorStatus: "confirmed",
          anchoredAt: "2026-01-15T12:00:00.000Z",
          verificationUrl: `https://cardanoscan.io/transaction/${TX_HASH}`,
        },
      });
      expect((doc as { deactivated?: boolean }).deactivated).toBeUndefined();
    });

    it("uses preprod.cardanoscan.io when the network is CARDANO_PREPROD", async () => {
      const resolver = new DidDocumentResolver(
        buildStore(buildAnchor({ network: "CARDANO_PREPROD" })),
      );
      const doc = await resolver.buildDidDocument(USER_ID);
      expect(doc?.proof.anchorChain).toBe("cardano:preprod");
      expect(doc?.proof.verificationUrl).toBe(
        `https://preprod.cardanoscan.io/transaction/${TX_HASH}`,
      );
    });

    it("rehydrates extra fields from documentCbor and overrides id with the canonical did", async () => {
      const onChainDoc = {
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: "did:web:stale", // stale value should be replaced
        alsoKnownAs: ["x:1"],
      };
      const cborBuf = cborEncode(onChainDoc);
      const resolver = new DidDocumentResolver(buildStore(buildAnchor({ documentCbor: cborBuf })));

      const doc = await resolver.buildDidDocument(USER_ID);
      expect(doc).not.toBeNull();
      expect(doc).toMatchObject({
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: USER_DID,
        alsoKnownAs: ["x:1"],
      });
    });

    it("falls back to the minimal document when documentCbor is malformed", async () => {
      const garbage = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
      const resolver = new DidDocumentResolver(buildStore(buildAnchor({ documentCbor: garbage })));
      const doc = await resolver.buildDidDocument(USER_ID);
      expect(doc).toMatchObject({
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: USER_DID,
      });
    });
  });

  describe("PENDING anchor (§F)", () => {
    it("returns a document immediately with anchorStatus=pending and null proof fields", async () => {
      const pending = buildAnchor({
        status: "PENDING",
        chainTxHash: null,
        chainOpIndex: null,
        confirmedAt: null,
      });
      const resolver = new DidDocumentResolver(buildStore(pending));
      const doc = await resolver.buildDidDocument(USER_ID);

      expect(doc).not.toBeNull();
      expect(doc?.proof).toMatchObject({
        anchorStatus: "pending",
        anchorTxHash: null,
        opIndexInTx: null,
        anchoredAt: null,
        verificationUrl: null,
        docHash: DOC_HASH,
      });
    });

    it("maps SUBMITTED status to anchorStatus=submitted", async () => {
      const submitted = buildAnchor({
        status: "SUBMITTED",
        confirmedAt: null,
      });
      const resolver = new DidDocumentResolver(buildStore(submitted));
      const doc = await resolver.buildDidDocument(USER_ID);
      expect(doc?.proof.anchorStatus).toBe("submitted");
      expect(doc?.proof.anchoredAt).toBeNull();
    });
  });

  describe("DEACTIVATE op (§E)", () => {
    it("returns a Tombstone document with deactivated=true and proof attached", async () => {
      const deactivated = buildAnchor({
        operation: "DEACTIVATE",
        documentCbor: null,
      });
      const resolver = new DidDocumentResolver(buildStore(deactivated));
      const doc = await resolver.buildDidDocument(USER_ID);

      expect(doc).not.toBeNull();
      expect(doc).toMatchObject({
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: USER_DID,
        deactivated: true,
        proof: { anchorStatus: "confirmed" },
      });
    });

    it("returns a Tombstone even when DEACTIVATE is still PENDING (§F)", async () => {
      const pendingDeact = buildAnchor({
        operation: "DEACTIVATE",
        status: "PENDING",
        chainTxHash: null,
        chainOpIndex: null,
        confirmedAt: null,
      });
      const resolver = new DidDocumentResolver(buildStore(pendingDeact));
      const doc = await resolver.buildDidDocument(USER_ID);
      expect((doc as { deactivated?: boolean }).deactivated).toBe(true);
      expect(doc?.proof.anchorStatus).toBe("pending");
      expect(doc?.proof.anchorTxHash).toBeNull();
    });
  });
});
