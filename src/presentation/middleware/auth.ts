import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IContext } from "@/types/server";
import { userAuthInclude, userAuthSelect } from "@/application/domain/account/user/data/type";
import { createLoaders, Loaders } from "@/presentation/graphql/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { auth } from "@/infrastructure/libs/firebase";
import logger from "@/infrastructure/logging";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";

function getIdTokenFromRequest(req: http.IncomingMessage): string | undefined {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer\s+/, "");
}

function getAdminApiKeyFromRequest(req: http.IncomingMessage): string | undefined {
  const key = req.headers["x-civicship-admin-api-key"];
  return typeof key === "string" ? key : undefined;
}

export async function createContext({ req }: { req: http.IncomingMessage }): Promise<IContext> {
  const issuer = new PrismaClientIssuer();
  const loaders: Loaders = createLoaders(issuer);
  const idToken = getIdTokenFromRequest(req);
  const adminApiKey = getAdminApiKeyFromRequest(req);
  const expectedAdminKey = process.env.CIVICSHIP_ADMIN_API_KEY;

  const phoneAuthToken = (req.headers["x-phone-auth-token"] as string) || "";
  const phoneRefreshToken = (req.headers["x-phone-refresh-token"] as string) || "";
  const phoneTokenExpiresAt = (req.headers["x-phone-token-expires-at"] as string) || "";
  const phoneUid = (req.headers["x-phone-uid"] as string) || "";
  const refreshToken = (req.headers["x-refresh-token"] as string) || "";
  const tokenExpiresAt = (req.headers["x-token-expires-at"] as string) || "";
  const communityId = (req.headers["x-community-id"] as string) || process.env.COMMUNITY_ID;

  if (!communityId) {
    throw new Error("Missing required header: x-community-id");
  }

  const isUserSignUpRequest = req.url?.includes('userSignUp') || 
                             (req as any).body?.operationName === 'userSignUp';
  
  if (isUserSignUpRequest) {
    logger.info("userSignUp request token analysis", {
      path: req.url || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      hasIdToken: !!idToken,
      idTokenLength: idToken ? idToken.length : 0,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken ? refreshToken.length : 0,
      hasPhoneAuthToken: !!phoneAuthToken,
      phoneAuthTokenLength: phoneAuthToken ? phoneAuthToken.length : 0,
      hasPhoneRefreshToken: !!phoneRefreshToken,
      phoneRefreshTokenLength: phoneRefreshToken ? phoneRefreshToken.length : 0,
      hasPhoneUid: !!phoneUid,
      phoneUidLength: phoneUid ? phoneUid.length : 0,
      hasPhoneTokenExpiresAt: !!phoneTokenExpiresAt,
      phoneTokenExpiresAt: phoneTokenExpiresAt || "not_provided",
      hasTokenExpiresAt: !!tokenExpiresAt,
      tokenExpiresAt: tokenExpiresAt || "not_provided",
      communityId: communityId || "not_provided",
      hasAdminApiKey: !!adminApiKey,
      component: "AuthMiddleware",
      operation: "userSignUp",
    });
  } else {
    logger.debug("Request token presence:", {
      path: req.url || "unknown",
      hasIdToken: !!idToken,
      hasRefreshToken: !!refreshToken,
      hasPhoneToken: !!phoneAuthToken,
      hasAdminApiKey: !!adminApiKey,
    });
  }

  if (adminApiKey && expectedAdminKey === undefined) {
    logger.warn("Admin API key is present, but expected key is undefined!");
  }

  if (adminApiKey) {
    if (adminApiKey === expectedAdminKey) {
      logger.info("Admin access via API key");
      return {
        issuer,
        loaders,
        communityId,
        isAdmin: true,

        phoneAuthToken,
        phoneRefreshToken,
        phoneTokenExpiresAt,
        phoneUid,
        refreshToken,
        tokenExpiresAt,
      };
    } else {
      logger.warn("Admin API key provided but does not match expected value", {
        received: adminApiKey,
      });
    }
  }

  if (!idToken) {
    return {
      issuer,
      loaders,
      phoneAuthToken,
      phoneRefreshToken,
      phoneTokenExpiresAt,
      phoneUid,
      refreshToken,
      tokenExpiresAt,
      communityId,
    };
  }

  const configService = container.resolve(CommunityConfigService);
  const tenantId = await configService.getFirebaseTenantId({ issuer } as IContext, communityId);

  try {
    const tenantedAuth = auth.tenantManager().authForTenant(tenantId);
    const decoded = await tenantedAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const platform = decoded.platform;

    const [currentUser, hasPermissions] = await Promise.all([
      issuer.internal(async (tx) =>
        tx.user.findFirst({
          where: { identities: { some: { uid } } },
          include: userAuthInclude,
        }),
      ),
      issuer.internal(async (tx) =>
        tx.user.findFirst({
          where: { identities: { some: { uid } } },
          select: userAuthSelect,
        }),
      ),
    ]);

    if (isUserSignUpRequest) {
      logger.info("userSignUp context created successfully", {
        uid,
        platform,
        tenantId,
        communityId,
        hasCurrentUser: !!currentUser,
        hasPermissions: !!hasPermissions,
        phoneUid,
        hasPhoneAuthToken: !!phoneAuthToken,
        hasPhoneRefreshToken: !!phoneRefreshToken,
        component: "AuthMiddleware",
        operation: "userSignUp",
      });
    }

    return {
      issuer,
      loaders,

      uid,
      tenantId,
      communityId,
      platform,

      currentUser,
      hasPermissions,

      phoneUid,
      phoneAuthToken,
      phoneRefreshToken,
      phoneTokenExpiresAt,

      idToken,
      refreshToken,
      tokenExpiresAt,
    };
  } catch (error) {
    if (isUserSignUpRequest) {
      logger.error("userSignUp token verification failed", {
        error: error instanceof Error ? error.message : String(error),
        hasIdToken: !!idToken,
        hasPhoneAuthToken: !!phoneAuthToken,
        hasPhoneUid: !!phoneUid,
        communityId,
        component: "AuthMiddleware",
        operation: "userSignUp",
        errorCategory: "token_verification_failed",
      });
    }
    
    return {
      communityId,
      issuer,
      loaders,
      phoneAuthToken,
      phoneRefreshToken,
      phoneTokenExpiresAt,
      phoneUid,
      refreshToken,
      tokenExpiresAt,
    };
  }
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}
