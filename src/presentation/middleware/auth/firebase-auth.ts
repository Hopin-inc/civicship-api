import http from "http";
import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { IContext } from "@/types/server";

function extractRequestInfo(req: http.IncomingMessage) {
  const getHeader = (key: string) => req.headers[key.toLowerCase()];

  // Extract client IP from various possible headers
  // x-forwarded-for can be: "ip1, ip2" or ["ip1, ip2"] or ["ip1", "ip2"]
  const forwardedFor = getHeader("x-forwarded-for");
  const realIp = getHeader("x-real-ip");

  let clientIp: string | undefined;
  if (forwardedFor) {
    const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    clientIp = forwardedIp.split(",")[0].trim();
  } else if (realIp) {
    const realIpValue = Array.isArray(realIp) ? realIp[0] : realIp;
    clientIp = realIpValue.split(",")[0].trim();
  } else {
    clientIp = req.socket.remoteAddress;
  }

  return {
    clientIp: clientIp || "unknown",
    userAgent: getHeader("user-agent") || "unknown",
    referer: getHeader("referer") || getHeader("referrer") || "none",
    origin: getHeader("origin") || "none",
    method: req.method || "unknown",
    url: req.url || "unknown",
    // Include all headers except sensitive ones
    headers: Object.fromEntries(
      Object.entries(req.headers).filter(([key]) =>
        !["authorization", "cookie", "x-civicship-admin-api-key"].includes(key.toLowerCase())
      )
    ),
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
    logger.error("❌ Missing x-community-id header", {
      ...requestInfo,
      authMode,
      hasIdToken: !!idToken,
      hasAdminKey: !!headers.adminApiKey,
    });
    throw new Error("Missing x-community-id header");
  }

  const loaders = createLoaders(prismaClient);
  if (!idToken) {
    logger.debug("🔓 Anonymous request - no idToken", { communityId });
    return { issuer, loaders, communityId };
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

    return { issuer, loaders, uid, idToken, platform, tenantId, communityId, currentUser };
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
