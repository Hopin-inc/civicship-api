/**
 * Public DID/VC routes (§5.4).
 *
 * Exposes three endpoints:
 *
 *   GET /.well-known/did.json
 *     Returns the civicship.app Issuer DID Document. Phase 1 step 8
 *     wires this through `IssuerDidUseCase` so the response carries the
 *     active KMS-backed `verificationMethod` whenever a key has been
 *     activated. Until then the use case returns `null` and we fall back
 *     to the minimal static `{ "@context", id }` body — preserving the
 *     dev/staging UX that existed before the use case landed.
 *
 *   GET /users/:userId/did.json
 *     Returns the User DID Document for `userId`. Delegates to
 *     `DidDocumentResolver.buildDidDocument(userId)` (#1096). Maps:
 *       - `null` (no anchor row at all)               → 404
 *       - DEACTIVATE op (Tombstone with deactivated)  → 200 (§E)
 *       - everything else (CREATE/UPDATE)             → 200
 *     The resolver itself handles PENDING / SUBMITTED / CONFIRMED proof
 *     state (§F), so we do not need extra branching here.
 *
 *   GET /vc/:vcId/inclusion-proof
 *     Returns the Merkle inclusion proof for a VC whose batch has been
 *     anchored on-chain (§5.4.6). Maps:
 *       - VC not found / not yet anchored / anchor PENDING|SUBMITTED|FAILED
 *                                                  → 404 (`not_anchored`)
 *       - CONFIRMED anchor                         → 200 with proof DTO
 *       - genuine errors (DB, malformed leaf set)  → 500
 *     The body shape is documented on `InclusionProofResponse` in the
 *     vcIssuance presenter — every byte field is hex-encoded so the
 *     verifier in civicship-portal can deserialize without ambiguity.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4   (public routes)
 *   docs/report/did-vc-internalization.md §5.4.3 (IssuerDidService)
 *   docs/report/did-vc-internalization.md §5.4.4 (UserDidDocumentService)
 *   docs/report/did-vc-internalization.md §B / §E / §F
 */

import express, { Request, Response } from "express";
import { container } from "tsyringe";
import IssuerDidUseCase from "@/application/domain/credential/issuerDid/usecase";
import VcIssuanceUseCase from "@/application/domain/credential/vcIssuance/usecase";
import {
  DidDocumentResolver,
  type DidDocumentWithProof,
} from "@/infrastructure/libs/did/didDocumentResolver";
import {
  USER_ID_REGEX,
  buildUserDid,
  isValidUserId,
} from "@/infrastructure/libs/did/userDidBuilder";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import type { IContext } from "@/types/server";

const router = express.Router();

// ---------------------------------------------------------------------------
// Issuer DID Document — /.well-known/did.json
// ---------------------------------------------------------------------------

/**
 * Minimal static fallback Document.
 *
 * Served when `IssuerDidUseCase.getActiveIssuerDidDocument()` returns
 * `null` — i.e. no active KMS key is registered yet (bootstrap state on
 * dev/staging). The shape is the smallest body every DID-aware verifier
 * accepts (`@context` + `id`); the absence of `verificationMethod` is
 * intentional and matches the spec's "no proofs yet" mode.
 *
 * Adding fields later is backward-compatible. Switching to the use case
 * happens automatically as soon as the first key is activated.
 */
const STATIC_FALLBACK_DOCUMENT = Object.freeze({
  "@context": ["https://www.w3.org/ns/did/v1"],
  id: "did:web:api.civicship.app",
});

router.get("/.well-known/did.json", async (_req: Request, res: Response) => {
  try {
    const useCase = container.resolve<IssuerDidUseCase>("IssuerDidUseCase");
    const document = await useCase.getActiveIssuerDidDocument();

    if (document === null) {
      // Bootstrap fallback — see `STATIC_FALLBACK_DOCUMENT` rationale.
      // Logged at debug level only; this is the expected steady state on
      // a freshly-deployed environment until the first key is provisioned.
      logger.debug("[router/did] no active issuer key — serving static fallback");
      return res.status(200).json(STATIC_FALLBACK_DOCUMENT);
    }

    return res.status(200).json(document);
  } catch (err) {
    // Genuine misconfiguration (bad KMS resource name, expired ADC, etc.).
    // Do NOT silently fall back to the static stub here — that would hide
    // the configuration error from operators and mislead verifiers into
    // accepting a Document that is missing the active verificationMethod.
    logger.error("[router/did] failed to build issuer DID Document", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    // TODO(verifier-DX): consider returning a more specific error code
    // alongside the existing shape so verifier clients can branch on it
    // without parsing the message string — e.g.
    //   { error: "issuer_did_document_unavailable", message: "..." }
    // This PR keeps `{ error: "Internal Server Error" }` to stay aligned
    // with the global 5xx contract used elsewhere in the API; switching
    // shapes is deferred until we audit every 5xx site for consistency
    // (separate PR).
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------------------------------------------------------------
// User DID Document — /users/:userId/did.json
// ---------------------------------------------------------------------------

router.get("/users/:userId/did.json", async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Re-uses the same predicate as `buildUserDid` / `assertValidUserId`
  // (`@/infrastructure/libs/did/userDidBuilder`) so the §9.2 regex / length
  // bounds live in exactly one place.
  if (!isValidUserId(userId)) {
    return res.status(400).json({
      error: "invalid_user_id",
      message: `userId must match ${USER_ID_REGEX} (design §9.2)`,
    });
  }

  try {
    const resolver = container.resolve<DidDocumentResolver>("DidDocumentResolver");
    const doc: DidDocumentWithProof | null = await resolver.buildDidDocument(userId);

    if (doc === null) {
      return res.status(404).json({
        error: "did_not_found",
        message: `No DID Document anchored for user ${buildUserDid(userId)}`,
      });
    }

    return res.status(200).json(doc);
  } catch (err) {
    // Mirror `src/index.ts` global error handler: log message + stack and
    // surface the same `{ error: "Internal Server Error" }` shape so HTTP
    // clients see a consistent 5xx contract across the API.
    logger.error("[router/did] failed to build user DID Document", {
      userId,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------------------------------------------------------------
// VC Inclusion Proof — /vc/:vcId/inclusion-proof
// ---------------------------------------------------------------------------

router.get("/vc/:vcId/inclusion-proof", async (req: Request, res: Response) => {
  const { vcId } = req.params;

  if (typeof vcId !== "string" || vcId.length === 0) {
    return res.status(400).json({
      error: "invalid_vc_id",
      message: "vcId is required",
    });
  }

  try {
    // Public route: there is no request-scoped issuer auth (no
    // session/idToken on `/vc/:id/inclusion-proof`). We construct a
    // minimal `IContext` carrying just the `PrismaClientIssuer` so the
    // service layer's `issuer.internal()` calls work — same shape as
    // the admin anchor-batch route (`router/admin/anchorBatch.ts`).
    const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
    const ctx = { issuer } as IContext;
    const usecase = container.resolve<VcIssuanceUseCase>("VcIssuanceUseCase");

    const proof = await usecase.getInclusionProof(ctx, vcId);
    if (proof === null) {
      return res.status(404).json({
        error: "not_anchored",
        message: `No confirmed anchor for VC ${vcId}`,
      });
    }
    return res.status(200).json(proof);
  } catch (err) {
    logger.error("[router/did] failed to build VC inclusion proof", {
      vcId,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
