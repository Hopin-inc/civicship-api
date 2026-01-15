import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { AuthMeta, IContext } from "@/types/server";
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

  const configService = container.resolve(CommunityConfigService);
  // Use null for communityId to get the shared/integrated Firebase tenant
  // This ensures all communities use the same LINE authentication (tenant-less)
  // The communityId header is still used for RLS (Row-Level Security) purposes
  const tenantId = await configService.getFirebaseTenantId({ issuer } as IContext, null);
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

    logger.debug("✅ Firebase user verified", {
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
