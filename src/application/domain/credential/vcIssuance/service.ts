/**
 * `VcIssuanceService` — application-layer entry point for civicship's
 * internal Verifiable Credential issuance flow (§5.2.2).
 *
 * Per design §5.2.2, each issuance:
 *
 *   1. Builds the W3C VC payload with a fixed civicship issuer DID.
 *   2. Reserves a StatusList slot for revocation (§D credentialStatus).
 *      ★ Phase 1 step 7 stub: StatusList domain lives in a sibling PR;
 *        this service emits a placeholder slot reference and leaves
 *        revocation wiring to Phase 1 step 9.
 *   3. Encodes header.payload as base64url, leaves the signature empty
 *      (stub — KMS signer is in `claude/phase1-infra-kms-issuer-did`,
 *      out of scope for this PR per task brief).
 *   4. Persists a `VcIssuanceRequest` row with `status = COMPLETED`. The
 *      `vcAnchorId` is filled in later by the weekly anchor batch.
 *
 * Why issue and persist with `COMPLETED` even before anchor confirmation:
 * §5.2.2 explicitly states "VC 本体は anchor 待ちなしで COMPLETED" — the
 * UI must be able to present the VC immediately. Anchor state lives on a
 * separate field (`vcAnchorId`) which the verifier inspects when stronger
 * trust guarantees are needed.
 *
 * The signature segment of the emitted JWT is currently a deterministic
 * stub marker (`STUB_SIGNATURE`) because the KMS signer lives in a
 * separate PR (`claude/phase1-infra-kms-issuer-did`). Real signing will
 * be wired in Phase 1 step 10; the unit tests already verify the JWT
 * shape so the swap is mechanical.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2 (this service)
 *   docs/report/did-vc-internalization.md §D     (BitstringStatusList)
 *   docs/report/did-vc-internalization.md §B     (issuer DID — civicship.app)
 */

import { inject, injectable } from "tsyringe";
import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import type { IVcIssuanceRepository } from "@/application/domain/credential/vcIssuance/data/interface";
import type {
  IssueVcInput,
  VcIssuanceRow,
} from "@/application/domain/credential/vcIssuance/data/type";
import StatusListService from "@/application/domain/credential/statusList/service";
import { CIVICSHIP_ISSUER_DID } from "@/application/domain/credential/shared/constants";

/**
 * Re-export so the public symbol's path stays stable. The canonical
 * definition now lives in `credential/shared/constants` — see that module
 * for the rationale (§B / §5.2.2).
 */
export { CIVICSHIP_ISSUER_DID };

/**
 * Phase 1 step 7 placeholder for the JWT signature. Real signing lives in
 * a sibling PR (`claude/phase1-infra-kms-issuer-did`) — we emit a
 * deterministic non-base64url marker so:
 *
 *   1. Tests can assert "this is a stub VC" without false positives.
 *   2. Verifiers will reject it (it's not a valid base64url signature).
 *   3. The grep target is unique enough to find every stub site once
 *      KMS lands.
 */
const STUB_SIGNATURE = "stub-not-signed";

/**
 * Build the unsigned VC payload (§5.2.2 `buildVcPayload`).
 *
 * Pure function so the JWT shape is testable without touching the service.
 * Returns the payload object that becomes the JWT's middle segment.
 */
export function buildVcPayload(input: {
  issuer: string;
  subject: string;
  claims: Record<string, unknown>;
  issuedAt: Date;
  /**
   * §D — when supplied, embedded as the W3C `credentialStatus` block so
   * verifiers can resolve revocation. Optional so legacy / replay paths
   * can still emit a payload without StatusList wiring (they will skip
   * persistence of `statusListIndex` / `statusListCredential` separately).
   */
  credentialStatus?: Record<string, unknown>;
}): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/data-integrity/v2",
    ],
    type: ["VerifiableCredential"],
    issuer: input.issuer,
    issuanceDate: input.issuedAt.toISOString(),
    credentialSubject: {
      id: input.subject,
      ...input.claims,
    },
  };
  if (input.credentialStatus) {
    payload.credentialStatus = input.credentialStatus;
  }
  return payload;
}

/**
 * Encode an arbitrary JSON-serializable object as base64url. Used for both
 * the JWT header and payload segments.
 *
 * Spec note: base64url is base64 with `+` → `-`, `/` → `_`, and trailing
 * `=` removed (RFC 4648 §5). `Buffer.toString("base64url")` does this
 * natively in Node ≥14.18.
 */
function base64urlEncodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

@injectable()
export default class VcIssuanceService {
  constructor(
    @inject("VcIssuanceRepository")
    private readonly repository: IVcIssuanceRepository,
    @inject("StatusListService")
    private readonly statusListService: StatusListService,
  ) {}

  /** Pass-through for the GraphQL `vcIssuance` query (Phase 1 step 8). */
  async findVcById(ctx: IContext, id: string): Promise<VcIssuanceRow | null> {
    return this.repository.findById(ctx, id);
  }

  /** Pass-through for the GraphQL `vcIssuancesByUser` query. */
  async findVcsByUserId(ctx: IContext, userId: string): Promise<VcIssuanceRow[]> {
    return this.repository.findByUserId(ctx, userId);
  }

  /**
   * §5.2.2: build a VC for the supplied claims, sign-stub it, and persist
   * the resulting row. Anchor wiring (vcAnchorId / anchorLeafIndex) is
   * left to the weekly batch.
   *
   * §D wiring (Phase 1 step 8): the StatusList slot is now reserved
   * inline so the issued VC carries a `credentialStatus` block and the
   * persisted row records `statusListIndex` / `statusListCredential` for
   * later revocation. The slot allocation runs inside the same `tx` as
   * the VC insert when one is supplied — the issuer wrapper at the
   * UseCase layer (§5.2.4) keeps the two writes consistent.
   */
  async issueVc(
    ctx: IContext,
    input: IssueVcInput,
    tx?: Prisma.TransactionClient,
  ): Promise<VcIssuanceRow> {
    // Capture the issuance instant exactly once: re-using the same `Date`
    // for both the JWT `issuanceDate` claim and downstream persistence
    // avoids sub-second drift between payload and DB row. Callers (tests,
    // replay batches) may override via `input.issuedAt`.
    const issuedAt = input.issuedAt ?? new Date();
    const issuerDid = CIVICSHIP_ISSUER_DID;

    // 0) Reserve the next StatusList bit index (§D / §7.2). Done before
    //    the VC payload build so `credentialStatus` can embed the URL +
    //    index before signing. The StatusList service handles bootstrap +
    //    capacity rollover; we just consume the returned slot.
    const slot = await this.statusListService.allocateNextSlot(ctx, tx);

    // 1) Build the W3C VC payload, now with §D `credentialStatus` so
    //    verifiers can resolve the revocation list.
    const vcPayload = buildVcPayload({
      issuer: issuerDid,
      subject: input.subjectDid,
      claims: input.claims,
      issuedAt,
      credentialStatus: {
        // The fragment binds the bit index to the list URL — verifiers
        // resolve `statusListCredential` and check bit `statusListIndex`.
        id: `${slot.statusListCredentialUrl}#${slot.statusListIndex}`,
        type: "StatusList2021Entry",
        statusPurpose: "revocation",
        // String per the W3C spec; integer is also accepted but string
        // matches the §D example in the design doc.
        statusListIndex: String(slot.statusListIndex),
        statusListCredential: slot.statusListCredentialUrl,
      },
    });

    // 2) Build a JWT-shape envelope. KMS-backed signing lands in
    //    `claude/phase1-infra-kms-issuer-did`; until then the signature
    //    segment is a deterministic stub marker (see `STUB_SIGNATURE`).
    const header = base64urlEncodeJson({
      alg: "EdDSA",
      typ: "JWT",
      // `kid` will reference the active KMS key id once it lands.
      kid: `${issuerDid}#stub`,
    });
    const payload = base64urlEncodeJson(vcPayload);
    const vcJwt = `${header}.${payload}.${STUB_SIGNATURE}`;

    logger.debug("[VcIssuanceService] issueVc", {
      userId: input.userId,
      subjectDid: input.subjectDid,
      issuerDid,
      vcFormat: "INTERNAL_JWT",
      // Don't log the full JWT — it includes the (stub) signature segment
      // and would create noise once real signatures arrive.
      jwtLength: vcJwt.length,
      statusListIndex: slot.statusListIndex,
      statusListCredential: slot.statusListCredentialUrl,
    });

    return this.repository.create(
      ctx,
      {
        userId: input.userId,
        evaluationId: input.evaluationId ?? null,
        issuerDid,
        subjectDid: input.subjectDid,
        vcFormat: "INTERNAL_JWT",
        vcJwt,
        // §D StatusList slot — wired via `StatusListService`. Recorded
        // here so the revocation flow can find the row by VC id.
        statusListIndex: slot.statusListIndex,
        statusListCredential: slot.statusListCredentialUrl,
        // §5.2.2: VC body is COMPLETED even before chain anchor.
        status: "COMPLETED",
      },
      tx,
    );
  }
}
