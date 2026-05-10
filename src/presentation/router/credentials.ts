/**
 * Public REST router for credential artefacts (§5.4.5).
 *
 * Routes:
 *
 *   - `GET /credentials/status/:statusListId.jwt`
 *       Public Bitstring Status List 2021 endpoint. Returns the latest
 *       list-VC JWT signed by the civicship issuer, or 404 when the list
 *       does not exist. Verifiers fetch this endpoint when they encounter a
 *       VC's `credentialStatus.statusListCredential` URL.
 *
 * Auth: open. The list VCs are public artefacts (any verifier on the
 * internet may resolve them), and they're already signed by the issuer
 * key — there is nothing private to protect here. CORS is wide open for
 * the same reason.
 *
 * Why a separate router instead of folding this into `did.ts` (§5.4): the
 * task brief explicitly partitions DID document delivery (sibling PR) and
 * credential artefacts so each module can ship and roll back independently.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.5 (this endpoint)
 *   docs/report/did-vc-internalization.md §7.2   (verifier flow)
 *   docs/report/did-vc-internalization.md §D     (BitstringStatusList spec)
 */

import express from "express";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import StatusListUseCase from "@/application/domain/credential/statusList/usecase";
import { IContext } from "@/types/server";

const router = express.Router();

// CORS: status list resolvers can come from any verifier on the internet.
// This mirrors the policy used by the DID router (§5.4.1).
router.use((_req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});

/**
 * GET /credentials/status/:statusListId.jwt
 *
 * Express path matching: the `:statusListId.jwt` segment is parsed by
 * Express into `req.params.statusListId` (everything before the `.jwt`
 * suffix). We expose the public-facing `listKey` here, not the row's
 * cuid — the URL is computed by `StatusListService.buildStatusListUrl`
 * and stamped into every issued VC, so it must remain stable across
 * deployments.
 */
router.get("/status/:statusListId.jwt", async (req, res) => {
  const { statusListId } = req.params;
  if (!statusListId) {
    return res.status(400).json({ error: "Missing statusListId" });
  }

  try {
    const issuer = new PrismaClientIssuer();
    const ctx = { issuer } as IContext;
    const usecase = container.resolve(StatusListUseCase);

    const jwt = await usecase.getEncodedListJwt(ctx, statusListId);
    if (!jwt) {
      // 404 with no body — verifiers parse the status code, not the body.
      return res.status(404).end();
    }

    res.set("Content-Type", "application/jwt");
    // Same 5-minute caching policy as the DID router (§5.4.1) — a
    // verifier polling once per VC verification is a non-event for our
    // origin server.
    res.set("Cache-Control", "public, max-age=300");
    return res.status(200).send(jwt);
  } catch (err) {
    logger.error("[credentials/status] unexpected error", {
      statusListId,
      message: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
