import express, { NextFunction, Request, Response } from "express";
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
 */
function requireDevLoginEnabled(_req: Request, res: Response, next: NextFunction): void {
  if (!isDevLoginEnabled()) {
    notFound(res);
    return;
  }
  next();
}

/**
 * Returns a dev token naming the community's shared demo account, creating that
 * account on the first call, so the caller is authenticated as a real
 * community-joined user — no LINE, no Firebase.
 *
 * Takes no input beyond the community: no identity, no role, no body at all. An
 * earlier revision accepted a uid to impersonate an existing account, which is
 * precisely what made a shared secret necessary to gate this route. Dropping it
 * means the endpoint can only ever name one account, whose uid this handler
 * derives and which lives only on a non-production database — so there is
 * nothing here worth guarding with a secret and the feature needs no
 * configuration at all.
 *
 * The account is an OWNER, so a tester lands able to reach the admin screens.
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

    // One account per community, not one per call. Reviewers looking at the same
    // deployment should see each other's bookings, and a visitor who loses their
    // cookie should come back to their own history rather than to an empty
    // account. It also stops the row-per-page-load the previous shape created: a
    // user, two identities, a membership and a wallet every time anyone landed.
    const uid = `${DEV_UID_PREFIX}shared-${communityId}`;

    const ctx = {
      issuer,
      loaders: createLoaders(prismaClient),
      communityId,
      uid,
    } as IContext;

    const useCase = container.resolve(IdentityUseCase);
    const user = await useCase.devProvisionAnonymousUser(ctx, uid, communityId, "Demo User");

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
 * The rate limiter goes first because this route reaches the database while
 * unauthenticated, and that is exactly what needs a ceiling. The cost is that a
 * disabled deployment still answers 429 under a burst instead of 404, which
 * reveals that the path exists.
 *
 * That leak is worth accepting: this repository is public, so the route is
 * discoverable by reading the source — hiding the path buys nothing, whereas an
 * unthrottled user-creating endpoint is a real weakness.
 *
 * No body parser: the handler reads nothing but the community header.
 */
router.post("/session", sessionLoginRateLimit, requireDevLoginEnabled, handleDevSession);

export default router;
