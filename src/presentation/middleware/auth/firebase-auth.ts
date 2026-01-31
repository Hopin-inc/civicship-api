import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";
import { AuthMeta, IContext } from "@/types/server";
import { AuthenticationError } from "@/errors/graphql";
import { container } from "tsyringe";
import MembershipService from "@/application/domain/account/membership/service";
import WalletService from "@/application/domain/account/wallet/service";

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

  // Use the shared/integrated LINE authentication
  // All communities use the same LINE login channel (configId = 'integrated')
  // The communityId header is used for membership lookup and RLS (Row-Level Security)
  const verificationMethod = authMode === "session" ? "verifySessionCookie" : "verifyIdToken";

  try {
    const decoded = await (authMode === "session"
      ? auth.verifySessionCookie(idToken, false)
      : auth.verifyIdToken(idToken));
    const uid = decoded.uid;
    const platform = decoded.platform;

    const provider = (decoded as any).firebase?.sign_in_provider;
    const decodedTenant = (decoded as any).firebase?.tenant;

    // First, try to find user with community-specific identity
    let currentUser = await issuer.internal((tx) =>
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
              OR: [{ platform: "PHONE" }, { communityId }, { communityId: null }],
            },
          },
          memberships: {
            where: { communityId },
          },
        },
      }),
    );

    // If not found, try to find user with global LINE identity (communityId = null)
    // This handles the integrated LINE channel case
    if (!currentUser) {
      currentUser = await issuer.internal((tx) =>
        tx.user.findFirst({
          where: {
            identities: {
              some: {
                uid: decoded.uid,
                communityId: null, // Global identity for integrated LINE channel
              },
            },
          },
          include: {
            identities: {
              where: {
                OR: [{ platform: "PHONE" }, { communityId }, { communityId: null }],
              },
            },
            memberships: {
              where: { communityId },
            },
          },
        }),
      );

      // If user found with global LINE identity, check if they have phone identity
      // and auto-create membership if needed
      if (currentUser) {
        const hasPhoneIdentity = currentUser.identities?.some(
          (identity) => identity.platform === "PHONE",
        );
        const hasMembership = currentUser.memberships && currentUser.memberships.length > 0;

        logger.debug("🔍 User found via global LINE identity", {
          userId: currentUser.id?.slice(-6),
          hasPhoneIdentity,
          hasMembership,
          communityId,
        });

        // Auto-create membership and wallet if user has phone identity but no membership
        if (hasPhoneIdentity && !hasMembership) {
          try {
            const membershipService = container.resolve(MembershipService);
            const walletService = container.resolve(WalletService);

            // Create a minimal context for the services
            const ctx: IContext = {
              issuer,
              loaders,
              communityId,
              uid: decoded.uid,
              currentUser,
            } as IContext;

            await issuer.public(ctx, async (tx) => {
              await membershipService.joinIfNeeded(ctx, currentUser!.id, communityId, tx);
              await walletService.createMemberWalletIfNeeded(ctx, currentUser!.id, communityId, tx);
            });

            // Re-fetch user to include the new membership
            currentUser = await issuer.internal((tx) =>
              tx.user.findFirst({
                where: { id: currentUser!.id },
                include: {
                  identities: {
                    where: {
                      OR: [{ platform: "PHONE" }, { communityId }, { communityId: null }],
                    },
                  },
                  memberships: {
                    where: { communityId },
                  },
                },
              }),
            );

            logger.info("✅ Auto-created membership for user with global LINE identity", {
              userId: currentUser?.id?.slice(-6),
              communityId,
            });
          } catch (membershipError) {
            logger.error("❌ Failed to auto-create membership", {
              userId: currentUser?.id?.slice(-6),
              communityId,
              error: membershipError instanceof Error ? membershipError.message : String(membershipError),
            });
            // Continue without membership - user will be redirected to phone verification
          }
        }
      }
    }

    logger.debug("✅ Firebase user verified", {
      method: verificationMethod,
      uid: decoded.uid.slice(-6),
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
      communityId,
      currentUser,
      authMeta,
    };
  } catch (err) {
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
