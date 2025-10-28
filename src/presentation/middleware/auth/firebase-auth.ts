import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { userAuthInclude } from "@/application/domain/account/user/data/type";
import { createLoaders } from "@/presentation/graphql/dataloader";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { IContext } from "@/types/server";

export async function handleFirebaseAuth(
  headers: AuthHeaders,
  issuer: PrismaClientIssuer,
): Promise<AuthResult> {
  const { idToken, authMode, communityId } = headers;
  if (!communityId) throw new Error("Missing x-community-id header");

  const loaders = createLoaders(issuer);
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
        include: userAuthInclude,
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
