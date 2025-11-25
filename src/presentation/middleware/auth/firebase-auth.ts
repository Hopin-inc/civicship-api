import http from "http";
import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { AuthMeta, IContext } from "@/types/server";
import { isBot, getBotName } from "./bot-detection";

function extractRequestInfo(req: http.IncomingMessage) {
  const getHeader = (key: string) => req.headers[key.toLowerCase()];

  function normalize(value?: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
  }

  const forwardedFor = getHeader("x-forwarded-for");
  const realIp = getHeader("x-real-ip");

  let clientIp: string | undefined;
  if (forwardedFor) {
    const forwarded = normalize(forwardedFor);
    clientIp = forwarded?.split(",")[0].trim();
  } else if (realIp) {
    const real = normalize(realIp);
    clientIp = real?.split(",")[0].trim();
  } else {
    clientIp = req.socket.remoteAddress;
  }

  const userAgent = normalize(getHeader("user-agent"));
  const referer = normalize(getHeader("referer")) || normalize(getHeader("referrer")) || "none";
  const origin = normalize(getHeader("origin")) || "none";

  const excluded = new Set(["authorization", "cookie", "x-civicship-admin-api-key"]);
  const safeHeaders = Object.fromEntries(
    Object.entries(req.headers).filter(([key]) => !excluded.has(key.toLowerCase())),
  );

  return {
    clientIp: clientIp || "unknown",
    userAgent: userAgent || "unknown",
    referer,
    origin,
    method: req.method || "unknown",
    url: req.url || "unknown",
    headers: safeHeaders,
  };
}

export async function handleFirebaseAuth(
  headers: AuthHeaders,
  issuer: PrismaClientIssuer,
  req: http.IncomingMessage,
): Promise<AuthResult> {
  const { idToken, authMode, communityId } = headers;

  if (!communityId) {
    const requestInfo = extractRequestInfo(req);
    const userAgent = requestInfo.userAgent;

    if (userAgent && isBot(userAgent)) {
      const botName = getBotName(userAgent);
      logger.debug("🤖 Bot request without x-community-id header (expected behavior)", {
        botName,
        userAgent,
        clientIp: requestInfo.clientIp,
        method: requestInfo.method,
        url: requestInfo.url,
      });
    } else {
      logger.error("❌ Missing x-community-id header", {
        ...requestInfo,
        authMode,
        hasIdToken: !!idToken,
        hasAdminKey: !!headers.adminApiKey,
      });
    }

    throw new Error("Missing x-community-id header");
  }

  const loaders = createLoaders(prismaClient);
  const authMeta: AuthMeta = {
    authMode: idToken ? authMode : "anonymous",
    hasIdToken: !!idToken,
    hasCookie: !!headers.hasCookie,
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
              OR: [
                { platform: "PHONE" },
                { communityId },
              ],
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

    return { issuer, loaders, uid, idToken, platform, tenantId, communityId, currentUser, authMeta };
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
    throw err;
  }
}
