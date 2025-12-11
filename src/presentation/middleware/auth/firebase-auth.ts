import http from "http";
import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { AuthMeta, IContext } from "@/types/server";
import { isBot, getBotName } from "./security/bot-detection";
import { AuthenticationError } from "@/errors/graphql";
import { isSuspiciousPath } from "@/presentation/middleware/auth/security/suspicious-paths";
import { extractRequestInfo } from "@/presentation/middleware/auth/security/extract-request-info";

export async function handleFirebaseAuth(
  headers: AuthHeaders,
  issuer: PrismaClientIssuer,
  req: http.IncomingMessage,
): Promise<AuthResult> {
  const url = req.url || "";
  const userAgent = req.headers["user-agent"];

  // ① パス攻撃（最優先でブロック）
  if (isSuspiciousPath(url)) {
    logger.warn("🚨 Suspicious path blocked", { url, userAgent });
    throw new AuthenticationError("Suspicious path blocked");
  }

  // ② Bot UA ブロック
  if (isBot(userAgent)) {
    const botName = getBotName(userAgent);
    logger.debug("🤖 Bot blocked", { botName, url });
    throw new AuthenticationError("Bot access blocked");
  }

  // ③ communityId が無い
  if (!headers.communityId) {
    const info = extractRequestInfo(req);
    logger.error("❌ Missing x-community-id header", info);
    throw new AuthenticationError("Missing x-community-id header");
  }

  // ④ ここから先が認証処理（既存コード）

  const { idToken, authMode, communityId } = headers;
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

  const configService = container.resolve(CommunityConfigService);
  const tenantId = await configService.getFirebaseTenantId({ issuer } as IContext, communityId);
  const verificationMethod = authMode === "session" ? "verifySessionCookie" : "verifyIdToken";

  try {
    const tenantedAuth = auth.tenantManager().authForTenant(tenantId);
    const decoded = await (authMode === "session"
      ? tenantedAuth.verifySessionCookie(idToken, false)
      : tenantedAuth.verifyIdToken(idToken));
    const uid = decoded.uid;
    const platform = decoded.platform;

    const provider = (decoded as any).firebase?.sign_in_provider;
    const decodedTenant = (decoded as any).firebase?.tenant;

    const currentUser = await issuer.internal((tx) =>
      tx.user.findFirst({
        where: { identities: { some: { uid: decoded.uid } } },
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

    logger.info("✅ Firebase user verified", {
      method: verificationMethod,
      uid: decoded.uid.slice(-6),
      tenantId,
      decodedTenant,
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
      tenantId,
      communityId,
      currentUser,
      authMeta,
    };
  } catch (err) {
    const error = err as any;
    logger.error("🔥 Firebase verification failed", {
      method: verificationMethod,
      tenantId,
      communityId,
      errorCode: error.code || "unknown",
      errorMessage: error.message,
      tokenLength: idToken.length,
    });
    throw new AuthenticationError("Firebase verification failed");
  }
}
