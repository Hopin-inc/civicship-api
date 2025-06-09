import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IContext } from "@/types/server";
import { userAuthInclude, userAuthSelect } from "@/application/domain/account/user/data/type";
import { createLoaders, Loaders } from "@/presentation/graphql/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { auth } from "@/infrastructure/libs/firebase";
import logger from "@/infrastructure/logging";

function getIdTokenFromRequest(req: http.IncomingMessage): string | undefined {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer\s+/, "");
}

export async function createContext({ req }: { req: http.IncomingMessage }): Promise<IContext> {
  const issuer = new PrismaClientIssuer();
  const loaders: Loaders = createLoaders(issuer);
  const idToken = getIdTokenFromRequest(req);

  const phoneAuthToken = (req.headers["x-phone-auth-token"] as string) || "";
  const phoneRefreshToken = (req.headers["x-phone-refresh-token"] as string) || "";
  const phoneTokenExpiresAt = (req.headers["x-phone-token-expires-at"] as string) || "";
  const phoneUid = (req.headers["x-phone-uid"] as string) || "";
  const refreshToken = (req.headers["x-refresh-token"] as string) || "";
  const tokenExpiresAt = (req.headers["x-token-expires-at"] as string) || "";
  const communityId = (req.headers["x-community-id"] as string) || "";

  logger.debug("Request token presence:", {
    path: req.url || "unknown",
    hasIdToken: !!idToken,
    hasRefreshToken: !!refreshToken,
    hasPhoneToken: !!phoneAuthToken,
  });

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
    };
  }

  const tenantId = process.env.FIREBASE_AUTH_TENANT_ID;
  if (!tenantId) {
    throw new Error("FIREBASE_AUTH_TENANT_ID not defined.");
  }
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

    return {
      issuer,
      loaders,

      uid,
      tenantId,
      platform,

      communityId,
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
  } catch {
    return {
      issuer,
      loaders,

      phoneUid,
      phoneAuthToken,
      phoneRefreshToken,
      phoneTokenExpiresAt,

      refreshToken,
      tokenExpiresAt,
    };
  }
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}
