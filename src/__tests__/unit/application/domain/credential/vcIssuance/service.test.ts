/**
 * Unit tests for `VcIssuanceService` (Phase 1 step 7).
 *
 * Strategy A: the repository is a stub but tests inject a `useValue` mock
 * so we can assert the persisted row shape. The KMS signer is also stubbed
 * via the `STUB_SIGNATURE` constant (real signing lands in
 * `claude/phase1-infra-kms-issuer-did`).
 */

import "reflect-metadata";
import { container } from "tsyringe";
import VcIssuanceService, {
  CIVICSHIP_ISSUER_DID,
  buildVcPayload,
} from "@/application/domain/credential/vcIssuance/service";
import { IContext } from "@/types/server";

const SUBJECT_DID = "did:web:api.civicship.app:users:u_xyz_phase1";
const SAMPLE_USER_ID = "u_xyz_phase1";

class MockVcIssuanceRepository {
  findById = jest.fn().mockResolvedValue(null);
  create = jest.fn();
}

function decodeJwtSegment(segment: string): unknown {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

describe("VcIssuanceService", () => {
  let mockRepository: MockVcIssuanceRepository;
  let service: VcIssuanceService;
  const mockCtx = {} as IContext;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockVcIssuanceRepository();
    container.register("VcIssuanceRepository", { useValue: mockRepository });
    container.register("VcIssuanceService", { useClass: VcIssuanceService });

    service = container.resolve(VcIssuanceService);
  });

  describe("issueVc", () => {
    it("persists a COMPLETED row with the civicship issuer DID and a JWT-shaped vcJwt", async () => {
      mockRepository.create.mockResolvedValue({ ok: true });

      await service.issueVc(mockCtx, {
        userId: SAMPLE_USER_ID,
        evaluationId: "eval-1",
        subjectDid: SUBJECT_DID,
        claims: { score: 5, label: "GOOD" },
      });

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
      // §D StatusList wiring lands in step 9 — null for now.
      expect(input.statusListIndex).toBeNull();
      expect(input.statusListCredential).toBeNull();
    });

    it("emits a JWT with three dot-separated segments, signature stub last", async () => {
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

      // The signature segment is a stub marker; verifiers must reject it.
      expect(segments[2]).toBe("stub-not-signed");
    });

    it("forwards the supplied tx to the repository", async () => {
      mockRepository.create.mockResolvedValue({ ok: true });
      const fakeTx = { sentinel: true } as never;

      await service.issueVc(
        mockCtx,
        { userId: SAMPLE_USER_ID, subjectDid: SUBJECT_DID, claims: {} },
        fakeTx,
      );

      const [, , txArg] = mockRepository.create.mock.calls[0];
      expect(txArg).toBe(fakeTx);
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
});
