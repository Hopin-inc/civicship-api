import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { AuthMeta } from "@/types/server";
import { GqlIdentityPlatform as IdentityPlatform } from "@/types/graphql";
import { DEV_UID_PREFIX, isDevLoginEnabled, verifyDevToken } from "@/config/devAuth";

/**
 * Dev-only authentication path.
 *
 * Resolves the current user straight from a dev token, skipping Firebase
 * entirely. Returns `null` whenever this does not apply — dev login disabled,
 * no token, malformed, expired, wrong community, a uid outside the dev namespace,
 * or no matching Identity — so the caller falls through to the normal Firebase
 * flow untouched.
 *
 * The user lookup is deliberately identical to `handleFirebaseAuth`'s: the only
 * thing that changes is how the uid is established, never what a session can see.
 */
export async function handleDevAuth(
  headers: AuthHeaders,
  issuer: PrismaClientIssuer,
): Promise<AuthResult | null> {
  if (!isDevLoginEnabled()) return null;

  const payload = verifyDevToken(headers.devToken);
  if (!payload) return null;

  // verifyDevToken already enforces this; repeated here so the invariant that
  // bounds a dev session to disposable accounts is visible at the lookup itself.
  if (!payload.uid.startsWith(DEV_UID_PREFIX)) return null;

  const communityId = headers.communityId!;

  // A token minted for one community must not authenticate against another.
  if (payload.communityId !== communityId) {
    logger.warn("🚫 [devAuth] Community mismatch on dev token", {
      tokenCommunityId: payload.communityId,
      requestCommunityId: communityId,
    });
    return null;
  }

  const currentUser = await issuer.internal((tx) =>
    tx.user.findFirst({
      where: {
        identities: {
          some: {
            uid: payload.uid,
            communityId,
          },
        },
      },
      include: {
        identities: {
          where: {
            OR: [{ platform: "PHONE" }, { communityId }],
          },
        },
        memberships: {
          where: { communityId },
        },
      },
    }),
  );

  // Dev login impersonates existing users only. An unknown uid is not an
  // invitation to create one — fall through and let the request be anonymous.
  if (!currentUser) {
    logger.warn("🚫 [devAuth] No user found for dev token uid", {
      uid: payload.uid.slice(-6),
      communityId,
    });
    return null;
  }

  const platform = currentUser.identities.find(
    (identity) => identity.uid === payload.uid,
  )?.platform as IdentityPlatform | undefined;

  const authMeta: AuthMeta = {
    authMode: "dev",
    hasIdToken: false,
    hasCookie: headers.hasCookie ?? false,
  };

  logger.info("🧪 [devAuth] Authenticated via dev login (Firebase bypassed)", {
    uid: payload.uid.slice(-6),
    userId: currentUser.id.slice(-6),
    communityId,
    platform,
    membershipsCount: currentUser.memberships?.length ?? 0,
  });

  return {
    issuer,
    loaders: createLoaders(prismaClient),
    uid: payload.uid,
    platform,
    communityId,
    currentUser,
    authMeta,
  };
}
