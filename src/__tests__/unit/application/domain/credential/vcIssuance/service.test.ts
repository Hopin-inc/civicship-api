/**
 * Unit tests for `VcIssuanceService` (Phase 1 step 7 + step 8 §D wiring).
 *
 * Strategy A: the repository is a stub but tests inject a `useValue` mock
 * so we can assert the persisted row shape. The KMS signer is also stubbed
 * via the `STUB_SIGNATURE` constant (real signing lands in
 * `claude/phase1-infra-kms-issuer-did`).
 *
 * Step 8 update: `StatusListService` is now a constructor dependency. We
 * inject a fake that returns a deterministic slot so the assertions can
 * pin the embedded `credentialStatus` block.
 *
 * Phase 2 prep update: `VcIssuanceService` now also resolves a
 * `VcJwtSigner` via DI (PR #1121). We register the production
 * `StubJwtSigner` instance so the produced JWT byte-matches the
 * pre-extraction version (`segments[2] === "stub-not-signed"`).
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { AnchorStatus } from "@prisma/client";
import VcIssuanceService, {
  CIVICSHIP_ISSUER_DID,
  buildVcPayload,
} from "@/application/domain/credential/vcIssuance/service";
import {
  StubJwtSigner,
  STUB_SIGNATURE,
} from "@/application/domain/credential/shared/stubJwtSigner";
import { buildRoot, verifyProof } from "@/infrastructure/libs/merkle/merkleTreeBuilder";
import type {
  VcAnchorRow,
  VcIssuanceRow,
  VcJwtLeaf,
} from "@/application/domain/credential/vcIssuance/data/type";
import { IContext } from "@/types/server";

const SUBJECT_DID = "did:web:api.civicship.app:users:u_xyz_phase1";
const SAMPLE_USER_ID = "u_xyz_phase1";
const FAKE_STATUS_URL = "https://api.civicship.app/credentials/status/1.jwt";

class MockVcIssuanceRepository {
  findById = jest.fn().mockResolvedValue(null);
  findByUserId = jest.fn().mockResolvedValue([]);
  // Phase 2: cascadeRevokeForUser drives the DID DEACTIVATE → VC revoke
  // flow (§14.2). Default to "no active VCs" so unrelated tests don't
  // accidentally enter the revoke loop.
  findActiveByUserId = jest.fn().mockResolvedValue([]);
  create = jest.fn();
  findVcAnchorById = jest.fn().mockResolvedValue(null);
  findVcJwtsByIds = jest.fn().mockResolvedValue([]);
}

function makeVcRow(overrides: Partial<VcIssuanceRow> = {}): VcIssuanceRow {
  return {
    id: "vc-1",
    userId: "u_1",
    evaluationId: "eval-1",
    issuerDid: CIVICSHIP_ISSUER_DID,
    subjectDid: SUBJECT_DID,
    vcFormat: "INTERNAL_JWT",
    vcJwt: "header.payload.sig-1",
    statusListIndex: 0,
    statusListCredential: FAKE_STATUS_URL,
    vcAnchorId: null,
    anchorLeafIndex: null,
    status: "COMPLETED",
    createdAt: new Date("2026-05-01T00:00:00Z"),
    completedAt: new Date("2026-05-01T00:00:00Z"),
    revokedAt: null,
    ...overrides,
  };
}

class MockStatusListService {
  // Deterministic slot so JWT assertions can compare exact strings.
  allocateNextSlot = jest.fn().mockResolvedValue({
    statusListId: "list-row-cuid",
    listKey: "1",
    statusListIndex: 42,
    statusListCredentialUrl: FAKE_STATUS_URL,
  });
  // Phase 2: cascadeRevokeForUser delegates to revokeVc per VC. Default
  // to a no-op so the call counter is meaningful in tests that opt in.
  revokeVc = jest.fn().mockResolvedValue(undefined);
}

function decodeJwtSegment(segment: string): unknown {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

describe("VcIssuanceService", () => {
  let mockRepository: MockVcIssuanceRepository;
  let mockStatusList: MockStatusListService;
  let service: VcIssuanceService;
  const mockCtx = {} as IContext;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockVcIssuanceRepository();
    mockStatusList = new MockStatusListService();
    container.register("VcIssuanceRepository", { useValue: mockRepository });
    container.register("StatusListService", { useValue: mockStatusList });
    // Phase 2 prep: VcIssuanceService now resolves `VcJwtSigner` from DI
    // rather than reaching for the inline `STUB_SIGNATURE` constant. We
    // bind the same `StubJwtSigner` used in production so the JWT output
    // stays byte-identical and the existing assertions
    // (`expect(segments[2]).toBe("stub-not-signed")`) keep passing.
    container.register("VcJwtSigner", {
      useValue: new StubJwtSigner({
        kid: `${CIVICSHIP_ISSUER_DID}#stub`,
        stubSignature: STUB_SIGNATURE,
      }),
    });
    container.register("VcIssuanceService", { useClass: VcIssuanceService });

    service = container.resolve(VcIssuanceService);
  });

  describe("issueVc", () => {
    it("persists a COMPLETED row with the civicship issuer DID, JWT-shaped vcJwt, and §D StatusList slot", async () => {
      mockRepository.create.mockResolvedValue({ ok: true });

      await service.issueVc(mockCtx, {
        userId: SAMPLE_USER_ID,
        evaluationId: "eval-1",
        subjectDid: SUBJECT_DID,
        claims: { score: 5, label: "GOOD" },
      });

      expect(mockStatusList.allocateNextSlot).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      const [ctxArg, input, txArg] = mockRepository.create.mock.calls[0];

      expect(ctxArg).toBe(mockCtx);
      expect(txArg).toBeUndefined();
      expect(input.userId).toBe(SAMPLE_USER_ID);
      expect(input.evaluationId).toBe("eval-1");
      expect(input.subjectDid).toBe(SUBJECT_DID);
      expect(input.issuerDid).toBe(CIVICSHIP_ISSUER_DID);
      expect(input.vcFormat).toBe("INTERNAL_JWT");
      // §5.2.2: VC body is COMPLETED even before chain anchor.
      expect(input.status).toBe("COMPLETED");
      // §D StatusList wiring (Phase 1 step 8) — slot from the mock.
      expect(input.statusListIndex).toBe(42);
      expect(input.statusListCredential).toBe(FAKE_STATUS_URL);
    });

    it("emits a JWT with three dot-separated segments, signature stub last, and embeds §D credentialStatus", async () => {
      mockRepository.create.mockResolvedValue({ ok: true });

      await service.issueVc(mockCtx, {
        userId: SAMPLE_USER_ID,
        subjectDid: SUBJECT_DID,
        claims: { score: 5 },
      });

      const [, input] = mockRepository.create.mock.calls[0];
      const segments = (input.vcJwt as string).split(".");
      expect(segments).toHaveLength(3);

      const header = decodeJwtSegment(segments[0]) as Record<string, unknown>;
      expect(header.alg).toBe("EdDSA");
      expect(header.typ).toBe("JWT");
      // The kid currently references the stub key — real KMS replaces this.
      expect(String(header.kid).startsWith(CIVICSHIP_ISSUER_DID)).toBe(true);

      const payload = decodeJwtSegment(segments[1]) as Record<string, unknown>;
      expect(payload.issuer).toBe(CIVICSHIP_ISSUER_DID);
      const subject = payload.credentialSubject as Record<string, unknown>;
      expect(subject.id).toBe(SUBJECT_DID);
      expect(subject.score).toBe(5);

      // §D credentialStatus block — mirrors the slot the StatusList service returned.
      const credentialStatus = payload.credentialStatus as Record<string, unknown>;
      expect(credentialStatus.id).toBe(`${FAKE_STATUS_URL}#42`);
      expect(credentialStatus.type).toBe("StatusList2021Entry");
      expect(credentialStatus.statusPurpose).toBe("revocation");
      expect(credentialStatus.statusListIndex).toBe("42");
      expect(credentialStatus.statusListCredential).toBe(FAKE_STATUS_URL);

      // The signature segment is a stub marker; verifiers must reject it.
      expect(segments[2]).toBe("stub-not-signed");
    });

    it("forwards the supplied tx to both the repository and the StatusList allocator", async () => {
      mockRepository.create.mockResolvedValue({ ok: true });
      const fakeTx = { sentinel: true } as never;

      await service.issueVc(
        mockCtx,
        { userId: SAMPLE_USER_ID, subjectDid: SUBJECT_DID, claims: {} },
        fakeTx,
      );

      const [, , repoTx] = mockRepository.create.mock.calls[0];
      expect(repoTx).toBe(fakeTx);
      // StatusList allocation must run inside the same transaction so the
      // slot reservation and the VC insert are atomic together.
      const [, slotTx] = mockStatusList.allocateNextSlot.mock.calls[0];
      expect(slotTx).toBe(fakeTx);
    });

    it("defaults evaluationId to null when omitted", async () => {
      mockRepository.create.mockResolvedValue({ ok: true });

      await service.issueVc(mockCtx, {
        userId: SAMPLE_USER_ID,
        subjectDid: SUBJECT_DID,
        claims: {},
      });

      const [, input] = mockRepository.create.mock.calls[0];
      expect(input.evaluationId).toBeNull();
    });
  });

  describe("buildVcPayload (pure function)", () => {
    it("attaches W3C contexts, type array, ISO issuanceDate, and merges claims into credentialSubject", () => {
      const issuedAt = new Date("2026-05-10T12:00:00Z");
      const payload = buildVcPayload({
        issuer: CIVICSHIP_ISSUER_DID,
        subject: SUBJECT_DID,
        claims: { score: 5, label: "GOOD" },
        issuedAt,
      });

      expect(payload["@context"]).toEqual([
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/data-integrity/v2",
      ]);
      expect(payload.type).toEqual(["VerifiableCredential"]);
      expect(payload.issuer).toBe(CIVICSHIP_ISSUER_DID);
      expect(payload.issuanceDate).toBe(issuedAt.toISOString());
      expect(payload.credentialSubject).toEqual({
        id: SUBJECT_DID,
        score: 5,
        label: "GOOD",
      });
    });
  });

  describe("generateInclusionProof (§5.4.6)", () => {
    /**
     * Helper: build the canonical sorted-leaf set for a fixture batch and
     * compute the on-chain root via `buildRoot`. The test then asserts
     * that the proof returned by the service verifies against THIS root,
     * which is what the design guarantees end-to-end.
     */
    function buildAnchoredFixture(jwts: string[]): {
      sorted: string[];
      rootHex: string;
      anchor: VcAnchorRow;
      leafRows: VcJwtLeaf[];
    } {
      const sorted = [...jwts].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      const rootBytes = buildRoot(sorted);
      const rootHex = Buffer.from(rootBytes).toString("hex");
      // VcAnchor.leafIds carry VcIssuanceRequest ids — use synthetic ids
      // 1:1 with each JWT so the repository mock can resolve them back.
      const leafRows = jwts.map((jwt, i) => ({
        vcIssuanceRequestId: `vc-${i}`,
        vcJwt: jwt,
      }));
      const anchor: VcAnchorRow = {
        id: "vca-1",
        rootHash: rootHex,
        leafIds: leafRows.map((r) => r.vcIssuanceRequestId),
        chainTxHash: "ab".repeat(32),
        blockHeight: 12345,
        status: AnchorStatus.CONFIRMED,
      };
      return { sorted, rootHex, anchor, leafRows };
    }

    it("returns a proof that verifies against the anchored root for a CONFIRMED batch", async () => {
      const jwts = ["d.payload", "a.payload", "c.payload", "b.payload", "e.payload"];
      const { anchor, leafRows, rootHex } = buildAnchoredFixture(jwts);
      const targetJwt = "c.payload";
      const targetVcId = leafRows.find((r) => r.vcJwt === targetJwt)!.vcIssuanceRequestId;

      mockRepository.findById.mockResolvedValueOnce(
        makeVcRow({ id: targetVcId, vcJwt: targetJwt, vcAnchorId: anchor.id }),
      );
      mockRepository.findVcAnchorById.mockResolvedValueOnce(anchor);
      mockRepository.findVcJwtsByIds.mockResolvedValueOnce(leafRows);

      const proof = await service.generateInclusionProof(mockCtx, targetVcId);

      expect(proof).not.toBeNull();
      expect(proof!.vcId).toBe(targetVcId);
      expect(proof!.vcJwt).toBe(targetJwt);
      expect(proof!.vcAnchorId).toBe(anchor.id);
      expect(proof!.rootHash).toBe(rootHex);
      expect(proof!.chainTxHash).toBe(anchor.chainTxHash);
      expect(proof!.blockHeight).toBe(anchor.blockHeight);

      // Verifier round-trip: rebuild bytes from hex and run verifyProof
      // against the same root the service published.
      const proofBytes = proof!.proofPath.map((h) => Buffer.from(h, "hex"));
      const rootBytes = Buffer.from(proof!.rootHash, "hex");
      expect(verifyProof(targetJwt, proof!.leafIndex, proofBytes, rootBytes)).toBe(true);
    });

    it("returns a verifying proof for a 7-leaf (odd) batch (last-leaf-duplication path)", async () => {
      // 7 leaves exercises the §5.1.7 odd-tail rule at multiple layers.
      const jwts = ["a", "b", "c", "d", "e", "f", "g"];
      const { anchor, leafRows } = buildAnchoredFixture(jwts);
      const targetJwt = "g"; // last leaf — sibling-self at the leaf layer
      const targetVcId = leafRows.find((r) => r.vcJwt === targetJwt)!.vcIssuanceRequestId;

      mockRepository.findById.mockResolvedValueOnce(
        makeVcRow({ id: targetVcId, vcJwt: targetJwt, vcAnchorId: anchor.id }),
      );
      mockRepository.findVcAnchorById.mockResolvedValueOnce(anchor);
      mockRepository.findVcJwtsByIds.mockResolvedValueOnce(leafRows);

      const proof = await service.generateInclusionProof(mockCtx, targetVcId);
      expect(proof).not.toBeNull();
      const proofBytes = proof!.proofPath.map((h) => Buffer.from(h, "hex"));
      const rootBytes = Buffer.from(proof!.rootHash, "hex");
      expect(verifyProof(targetJwt, proof!.leafIndex, proofBytes, rootBytes)).toBe(true);
    });

    it("returns null when the VC row is missing", async () => {
      mockRepository.findById.mockResolvedValueOnce(null);
      const result = await service.generateInclusionProof(mockCtx, "missing");
      expect(result).toBeNull();
      expect(mockRepository.findVcAnchorById).not.toHaveBeenCalled();
    });

    it("returns null when the VC has no vcAnchorId yet", async () => {
      mockRepository.findById.mockResolvedValueOnce(makeVcRow({ id: "vc-1", vcAnchorId: null }));
      const result = await service.generateInclusionProof(mockCtx, "vc-1");
      expect(result).toBeNull();
      expect(mockRepository.findVcAnchorById).not.toHaveBeenCalled();
    });

    it("returns null when the VC's JWT is empty (unidentifiable leaf)", async () => {
      mockRepository.findById.mockResolvedValueOnce(
        makeVcRow({ id: "vc-1", vcJwt: "", vcAnchorId: "vca-1" }),
      );
      const result = await service.generateInclusionProof(mockCtx, "vc-1");
      expect(result).toBeNull();
      expect(mockRepository.findVcAnchorById).not.toHaveBeenCalled();
    });

    it("returns null when the anchor row is missing (VC points at vanished anchor)", async () => {
      mockRepository.findById.mockResolvedValueOnce(
        makeVcRow({ id: "vc-1", vcJwt: "j", vcAnchorId: "vca-missing" }),
      );
      mockRepository.findVcAnchorById.mockResolvedValueOnce(null);
      const result = await service.generateInclusionProof(mockCtx, "vc-1");
      expect(result).toBeNull();
    });

    it("returns null when the anchor is PENDING (not yet anchored on-chain)", async () => {
      const { leafRows } = buildAnchoredFixture(["a", "b"]);
      const pending: VcAnchorRow = {
        id: "vca-pending",
        rootHash: "00".repeat(32),
        leafIds: leafRows.map((r) => r.vcIssuanceRequestId),
        chainTxHash: null,
        blockHeight: null,
        status: AnchorStatus.PENDING,
      };
      mockRepository.findById.mockResolvedValueOnce(
        makeVcRow({ id: leafRows[0].vcIssuanceRequestId, vcJwt: "a", vcAnchorId: pending.id }),
      );
      mockRepository.findVcAnchorById.mockResolvedValueOnce(pending);

      const result = await service.generateInclusionProof(mockCtx, leafRows[0].vcIssuanceRequestId);
      expect(result).toBeNull();
      // We never reach the leaf re-fetch when the anchor is not CONFIRMED.
      expect(mockRepository.findVcJwtsByIds).not.toHaveBeenCalled();
    });

    it("returns null when the anchor is SUBMITTED (chain not finalised)", async () => {
      const { leafRows } = buildAnchoredFixture(["a", "b"]);
      const submitted: VcAnchorRow = {
        id: "vca-submitted",
        rootHash: "11".repeat(32),
        leafIds: leafRows.map((r) => r.vcIssuanceRequestId),
        chainTxHash: "cd".repeat(32),
        blockHeight: null,
        status: AnchorStatus.SUBMITTED,
      };
      mockRepository.findById.mockResolvedValueOnce(
        makeVcRow({
          id: leafRows[0].vcIssuanceRequestId,
          vcJwt: "a",
          vcAnchorId: submitted.id,
        }),
      );
      mockRepository.findVcAnchorById.mockResolvedValueOnce(submitted);

      const result = await service.generateInclusionProof(mockCtx, leafRows[0].vcIssuanceRequestId);
      expect(result).toBeNull();
    });

    it("throws when the row's JWT is not present in the anchor's leaf set (integrity violation)", async () => {
      const { anchor, leafRows } = buildAnchoredFixture(["a", "b", "c"]);
      // Row claims membership but its JWT is foreign — should NOT be a
      // happy null (that would silently produce a misleading 404).
      mockRepository.findById.mockResolvedValueOnce(
        makeVcRow({ id: leafRows[0].vcIssuanceRequestId, vcJwt: "FOREIGN", vcAnchorId: anchor.id }),
      );
      mockRepository.findVcAnchorById.mockResolvedValueOnce(anchor);
      mockRepository.findVcJwtsByIds.mockResolvedValueOnce(leafRows);

      await expect(
        service.generateInclusionProof(mockCtx, leafRows[0].vcIssuanceRequestId),
      ).rejects.toThrow(/not present in anchor/);
    });
  });

  describe("cascadeRevokeForUser (Phase 2 §14.2 / §E)", () => {
    // Sentinel `tx` so we can assert the same client is forwarded to both
    // the repository read and every StatusList write.
    const tx = { sentinel: "tx" } as never;

    it("revokes every active VC for the user via StatusListService.revokeVc", async () => {
      const rows = [
        makeVcRow({ id: "vc-a", statusListIndex: 1 }),
        makeVcRow({ id: "vc-b", statusListIndex: 2 }),
      ];
      mockRepository.findActiveByUserId.mockResolvedValueOnce(rows);

      const count = await service.cascadeRevokeForUser(mockCtx, "u_1", tx);

      expect(count).toBe(2);
      expect(mockRepository.findActiveByUserId).toHaveBeenCalledWith(mockCtx, "u_1", tx);
      expect(mockStatusList.revokeVc).toHaveBeenCalledTimes(2);
      expect(mockStatusList.revokeVc).toHaveBeenNthCalledWith(
        1,
        mockCtx,
        { vcRequestId: "vc-a", reason: "did-deactivated" },
        tx,
      );
      expect(mockStatusList.revokeVc).toHaveBeenNthCalledWith(
        2,
        mockCtx,
        { vcRequestId: "vc-b", reason: "did-deactivated" },
        tx,
      );
    });

    it("returns 0 and does not call the StatusList when the user has no active VCs", async () => {
      mockRepository.findActiveByUserId.mockResolvedValueOnce([]);

      const count = await service.cascadeRevokeForUser(mockCtx, "u_lonely", tx);

      expect(count).toBe(0);
      expect(mockStatusList.revokeVc).not.toHaveBeenCalled();
    });

    it("is idempotent because findActiveByUserId filters revokedAt IS NULL at the repo layer", async () => {
      // Simulate the second cascade call: every prior revocation already
      // stamped revokedAt, so the repo returns nothing.
      mockRepository.findActiveByUserId.mockResolvedValueOnce([]);

      const count = await service.cascadeRevokeForUser(mockCtx, "u_already_revoked", tx);

      expect(count).toBe(0);
      expect(mockStatusList.revokeVc).not.toHaveBeenCalled();
    });

    it("skips rows that have no §D StatusList wiring without blocking the cascade", async () => {
      const rows = [
        // Pre-§D row — no statusListIndex / statusListCredential. Must be
        // skipped (we have no bit to flip) but must not stop later rows.
        makeVcRow({ id: "vc-legacy", statusListIndex: null, statusListCredential: null }),
        makeVcRow({ id: "vc-modern", statusListIndex: 7 }),
      ];
      mockRepository.findActiveByUserId.mockResolvedValueOnce(rows);

      const count = await service.cascadeRevokeForUser(mockCtx, "u_mixed", tx);

      expect(count).toBe(1);
      expect(mockStatusList.revokeVc).toHaveBeenCalledTimes(1);
      expect(mockStatusList.revokeVc).toHaveBeenCalledWith(
        mockCtx,
        { vcRequestId: "vc-modern", reason: "did-deactivated" },
        tx,
      );
    });

    it("respects a custom reason when supplied", async () => {
      mockRepository.findActiveByUserId.mockResolvedValueOnce([makeVcRow({ id: "vc-a" })]);

      await service.cascadeRevokeForUser(mockCtx, "u_1", tx, "operator-purge");

      expect(mockStatusList.revokeVc).toHaveBeenCalledWith(
        mockCtx,
        { vcRequestId: "vc-a", reason: "operator-purge" },
        tx,
      );
    });

    it("propagates errors from StatusListService.revokeVc so the surrounding tx rolls back", async () => {
      mockRepository.findActiveByUserId.mockResolvedValueOnce([
        makeVcRow({ id: "vc-a" }),
        makeVcRow({ id: "vc-b" }),
      ]);
      mockStatusList.revokeVc.mockRejectedValueOnce(new Error("KMS down"));

      await expect(service.cascadeRevokeForUser(mockCtx, "u_1", tx)).rejects.toThrow(/KMS down/);
      // The second VC must NOT be revoked — leaving the tx half-applied
      // is exactly what the surrounding usecase transaction prevents.
      expect(mockStatusList.revokeVc).toHaveBeenCalledTimes(1);
    });
  });
});
