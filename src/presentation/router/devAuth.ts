import express from "express";
import crypto from "crypto";
import { container } from "tsyringe";
import logger from "@/infrastructure/logging";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import { prismaClient } from "@/infrastructure/prisma/client";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { IContext } from "@/types/server";
import { sessionLoginRateLimit } from "@/presentation/middleware/rate-limit";
import { isDevLoginEnabled, isValidDevLoginSecret, issueDevToken } from "@/config/devAuth";

const router = express();

/** Prefix that makes dev-provisioned identities trivially greppable and deletable. */
const DEV_UID_PREFIX = "dev-anon-";

/**
 * Every failure mode answers 404, including a bad secret.
 * On a deployment where dev login is off, the route must be indistinguishable
 * from one that was never mounted — a 401 would confirm it exists.
 */
const notFound = (res: express.Response) => res.status(404).json({ error: "Not found" });

/**
 * POST /dev-auth/session
 *
 * Dev-only. Mints a dev token so the caller is authenticated as a real,
 * community-joined user — no LINE, no Firebase.
 *
 * Body: { uid?: string }
 *   - uid given     → impersonate that existing identity (404 if unknown)
 *   - uid omitted   → provision a fresh throwaway user and impersonate it
 *
 * Requires the `x-dev-login-secret` header, so only the portal's server-side
 * route can call it — never the browser directly.
 */
router.post("/session", express.json(), sessionLoginRateLimit, async (req, res) => {
  if (!isDevLoginEnabled()) return notFound(res);

  const secret = req.headers["x-dev-login-secret"];
  if (!isValidDevLoginSecret(typeof secret === "string" ? secret : undefined)) {
    logger.warn("🚫 [devAuth] Rejected /dev-auth/session: bad or missing secret");
    return notFound(res);
  }

  const communityId = req.headers["x-community-id"];
  if (typeof communityId !== "string" || !communityId) {
    return res.status(400).json({ error: "Missing x-community-id header" });
  }

  const requestedUid: unknown = req.body?.uid;
  if (requestedUid !== undefined && typeof requestedUid !== "string") {
    return res.status(400).json({ error: "uid must be a string" });
  }

  const issuer = new PrismaClientIssuer();

  try {
    const community = await issuer.internal((tx) =>
      tx.community.findUnique({ where: { id: communityId }, select: { id: true } }),
    );
    if (!community) {
      return res.status(404).json({ error: "Unknown community" });
    }

    // Impersonate an existing identity when one was named.
    if (requestedUid) {
      const identity = await issuer.internal((tx) =>
        tx.identity.findFirst({
          where: { uid: requestedUid, communityId },
          select: { uid: true, user: { select: { id: true, name: true } } },
        }),
      );
      if (!identity) {
        logger.warn("🚫 [devAuth] No identity for requested uid", { communityId });
        return notFound(res);
      }

      const { token, expiresAt } = issueDevToken(identity.uid, communityId);
      return res.json({
        devToken: token,
        expiresAt,
        user: { id: identity.user.id, name: identity.user.name, uid: identity.uid },
        provisioned: false,
      });
    }

    // Otherwise mint a brand-new throwaway user so each tester is isolated.
    const suffix = crypto.randomBytes(8).toString("hex");
    const uid = `${DEV_UID_PREFIX}${suffix}`;

    const ctx = {
      issuer,
      loaders: createLoaders(prismaClient),
      communityId,
      uid,
    } as IContext;

    const useCase = container.resolve(IdentityUseCase);
    const user = await useCase.devProvisionAnonymousUser(
      ctx,
      uid,
      communityId,
      `テストユーザー ${suffix.slice(0, 6)}`,
    );

    const { token, expiresAt } = issueDevToken(uid, communityId);
    return res.json({
      devToken: token,
      expiresAt,
      user: { id: user.id, name: user.name, uid },
      provisioned: true,
    });
  } catch (error) {
    logger.error("🔥 [devAuth] /dev-auth/session failed", {
      communityId,
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Dev login failed" });
  }
});

export default router;
