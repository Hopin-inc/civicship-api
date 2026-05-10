/**
 * Public DID/VC routes (§5.4).
 *
 * Exposes three endpoints:
 *
 *   GET /.well-known/did.json
 *     Returns the civicship.app issuer DID Document. This PR ships a
 *     minimal static `{ "@context", id }` body — the full document
 *     (with KMS-backed verificationMethod + service entries) is built
 *     by `IssuerDidBuilder` in a sibling PR (claude/phase1-infra-kms-issuer-did).
 *     We deliberately do NOT import that builder here so this PR builds
 *     standalone; once the builder lands the resolver will switch.
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
 *     Stubbed 501 Not Implemented for this PR. The real handler depends
 *     on the batch worker (Phase 1 step 7) that produces Merkle inclusion
 *     proofs for VCs once their batch is anchored. Returning 501 — rather
 *     than 404 — communicates "endpoint exists but not yet implemented"
 *     and lets clients retry later without changing URL.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4   (public routes)
 *   docs/report/did-vc-internalization.md §5.4.4 (UserDidDocumentService)
 *   docs/report/did-vc-internalization.md §B / §E / §F
 */

import express, { Request, Response } from "express";
import { container } from "tsyringe";
import {
  DidDocumentResolver,
  type DidDocumentWithProof,
} from "@/infrastructure/libs/did/didDocumentResolver";
import { USER_ID_REGEX, buildUserDid } from "@/infrastructure/libs/did/userDidBuilder";
import logger from "@/infrastructure/logging";

const router = express.Router();

// ---------------------------------------------------------------------------
// Issuer DID Document — /.well-known/did.json
// ---------------------------------------------------------------------------

/**
 * Build the minimal issuer DID Document for civicship.app.
 *
 * This is the static stand-in until `IssuerDidBuilder` (sibling PR
 * claude/phase1-infra-kms-issuer-did) provides the full document with
 * KMS-derived verificationMethod entries.
 *
 * The shape matches what every DID-aware verifier expects at minimum:
 *   `@context` + `id`. Adding fields later is backward-compatible.
 */
function buildIssuerDidDocument(): { "@context": readonly string[]; id: string } {
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: "did:web:api.civicship.app",
  };
}

router.get("/.well-known/did.json", (_req: Request, res: Response) => {
  res.status(200).json(buildIssuerDidDocument());
});

// ---------------------------------------------------------------------------
// User DID Document — /users/:userId/did.json
// ---------------------------------------------------------------------------

/**
 * Validate `userId` against the same regex used by `buildUserDid` (§9.2)
 * BEFORE reaching the resolver, so malformed IDs return 400 — never
 * leaking through to a database query that would always miss anyway.
 */
function isValidUserId(userId: string): boolean {
  return (
    typeof userId === "string" &&
    userId.length > 0 &&
    userId.length <= 64 &&
    USER_ID_REGEX.test(userId)
  );
}

router.get("/users/:userId/did.json", async (req: Request, res: Response) => {
  const { userId } = req.params;

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
    logger.error("[router/did] failed to build user DID Document", {
      userId,
      err: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({ error: "internal_error" });
  }
});

// ---------------------------------------------------------------------------
// VC Inclusion Proof — /vc/:vcId/inclusion-proof
// ---------------------------------------------------------------------------

router.get("/vc/:vcId/inclusion-proof", (req: Request, res: Response) => {
  const { vcId } = req.params;

  if (typeof vcId !== "string" || vcId.length === 0) {
    return res.status(400).json({
      error: "invalid_vc_id",
      message: "vcId is required",
    });
  }

  return res.status(501).json({
    error: "not_implemented",
    message: "VC inclusion-proof endpoint will land in Phase 1 step 7 (batch worker)",
  });
});

export default router;
