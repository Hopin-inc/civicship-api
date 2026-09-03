import express, { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { container } from "tsyringe";
import logger from "@/infrastructure/logging";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { IContext } from "@/types/server";
import { sessionLoginRateLimit } from "@/presentation/middleware/rate-limit";
import { DEV_UID_PREFIX, isDevLoginEnabled, issueDevToken } from "@/config/devAuth";

const router = express();

/**
 * On a deployment where dev login is off, the route must be indistinguishable
 * from one that was never mounted — a 401 would confirm it exists.
 */
const notFound = (res: Response) => res.status(404).json({ error: "Not found" });

/**
 * Rejects everything with 404 when dev login is disabled.
 *
 * Runs ahead of the body parser so that a malformed body on a disabled
 * deployment still answers 404 rather than 400 — see the ordering note on the
 * route below for why it runs *behind* the rate limiter.
 */
function requireDevLoginEnabled(_req: Request, res: Response, next: NextFunction): void {
  if (!isDevLoginEnabled()) {
    notFound(res);
    return;
  }
  next();
}

/**
 * Provisions a throwaway user and returns a dev token naming it, so the caller
 * is authenticated as a real, community-joined user — no LINE, no Firebase.
 *
 * Takes no identity from the caller. An earlier revision accepted a uid to
 * impersonate an existing account, which is precisely what made a shared secret
 * necessary to gate this route. Dropping it means the endpoint can only ever hand
 * out a fresh disposable account, so there is nothing here worth guarding with a
 * secret and the feature needs no configuration at all.
 */
async function handleDevSession(req: Request, res: Response) {
  const communityId = req.headers["x-community-id"];
  if (typeof communityId !== "string" || !communityId) {
    return res.status(400).json({ error: "Missing x-community-id header" });
  }

  const issuer = new PrismaClientIssuer();

  try {
    const community = await issuer.internal((tx) =>
      tx.community.findUnique({ where: { id: communityId }, select: { id: true } }),
    );
    if (!community) {
      return res.status(404).json({ error: "Unknown community" });
    }

    // A fresh user per call, so testers never share state.
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
    });
  } catch (error) {
    logger.error("🔥 [devAuth] /dev-auth/session failed", {
      communityId,
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Dev login failed" });
  }
}

/**
 * Middleware order here is a deliberate trade-off between two opposing concerns.
 *
 * The rate limiter goes first because this route creates a database record while
 * unauthenticated, and that is exactly what needs a ceiling. The cost is that a
 * disabled deployment still answers 429 under a burst instead of 404, which
 * reveals that the path exists.
 *
 * That leak is worth accepting: this repository is public, so the route is
 * discoverable by reading the source — hiding the path buys nothing, whereas an
 * unthrottled user-creating endpoint is a real weakness.
 *
 * The disabled gate still precedes the body parser, so the more useful half of
 * hiding the route survives: a malformed body answers 404, not 400.
 */
router.post(
  "/session",
  sessionLoginRateLimit,
  requireDevLoginEnabled,
  express.json(),
  handleDevSession,
);

export default router;
