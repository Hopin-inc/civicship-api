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
  if (!idToken) return { issuer, loaders, communityId };

  const configService = container.resolve(CommunityConfigService);
  const tenantId = await configService.getFirebaseTenantId({ issuer } as IContext, communityId);

  try {
    const tenantedAuth = auth.tenantManager().authForTenant(tenantId);
    const decoded = await (authMode === "session"
      ? tenantedAuth.verifySessionCookie(idToken, false)
      : tenantedAuth.verifyIdToken(idToken));

    const currentUser = await issuer.internal((tx) =>
      tx.user.findFirst({
        where: { identities: { some: { uid: decoded.uid } } },
        include: userAuthInclude,
      }),
    );

    logger.info("✅ Firebase user verified", { uid: decoded.uid, tenantId });
    return { issuer, loaders, uid: decoded.uid, tenantId, communityId, currentUser };
  } catch (err) {
    logger.error("🔥 Firebase verification failed", { message: (err as Error).message });
    throw err;
  }
}
