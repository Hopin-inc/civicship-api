import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { AuthMeta } from "@/types/server";
import { AuthenticationError } from "@/errors/graphql";

export async function handleFirebaseAuth(
  headers: AuthHeaders,
  issuer: PrismaClientIssuer,
): Promise<AuthResult> {
  const { idToken, authMode } = headers;
  const communityId = headers.communityId!;

  const loaders = createLoaders(prismaClient);
  const authMeta: AuthMeta = {
    authMode: idToken ? authMode : "anonymous",
    hasIdToken: !!idToken,
    hasCookie: headers.hasCookie ?? false,
  };

  if (!idToken) {
    logger.debug("🔓 Anonymous request - no idToken", { communityId, authMeta });
    return { issuer, loaders, communityId, authMeta };
  }

  const verificationMethod = authMode === "session" ? "verifySessionCookie" : "verifyIdToken";

  try {
    const decoded = await (authMode === "session"
      ? auth.verifySessionCookie(idToken, true)
      : auth.verifyIdToken(idToken));
    const uid = decoded.uid;
    const platform = decoded.platform;

    const provider = (decoded as any).firebase?.sign_in_provider;

    const currentUser = await issuer.internal((tx) =>
      tx.user.findFirst({
        where: {
          identities: {
            some: {
              uid: decoded.uid,
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

    logger.debug("✅ Firebase user verified", {
      method: verificationMethod,
      uid: decoded.uid.slice(-6),
      provider,
      communityId,
      hasCurrentUser: !!currentUser,
      userId: currentUser?.id?.slice(-6),
      membershipsCount: currentUser?.memberships?.length || 0,
    });

    return {
      issuer,
      loaders,
      uid,
      idToken,
      platform,
      communityId,
      currentUser,
      authMeta,
    };
  } catch (err) {
    if (err instanceof AuthenticationError) {
      throw err;
    }
    const error = err as any;
    logger.error("🔥 Firebase verification failed", {
      method: verificationMethod,
      communityId,
      errorCode: error.code || "unknown",
      errorMessage: error.message,
      tokenLength: idToken.length,
    });
    throw new AuthenticationError("Firebase verification failed");
  }
}
