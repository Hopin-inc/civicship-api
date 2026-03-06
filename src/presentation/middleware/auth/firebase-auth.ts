import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { AuthMeta } from "@/types/server";
import { AuthenticationError } from "@/errors/graphql";

const STALE_SESSION_ERRORS = [
  "auth/user-not-found", // テナント移行後の残存cookie
  "auth/session-cookie-revoked", // 明示的にrevokeされたcookie
  "auth/session-cookie-expired", // 期限切れcookie
  "auth/invalid-session-cookie", // 不正なcookie
];

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

    // session cookie 固有のステールエラーは throw してフロントエンドに通知
    // フロントエンドの useStaleSessionRecovery が HTTP 500 を検知して cookie をクリアする
    if (authMode === "session" && STALE_SESSION_ERRORS.includes(error.code)) {
      logger.warn("🍪 Stale session cookie detected - signaling to client", {
        method: verificationMethod,
        communityId,
        errorCode: error.code,
      });
      throw new AuthenticationError("Stale session cookie");
    }

    // その他のエラー（idTokenモード、ネットワーク障害等）は anonymous fallback を維持
    logger.warn("🔥 Firebase verification failed - falling back to anonymous", {
      method: verificationMethod,
      communityId,
      errorCode: error.code || "unknown",
      errorMessage: error.message,
      tokenLength: idToken.length,
    });
    return { issuer, loaders, communityId, authMeta };
  }
}
