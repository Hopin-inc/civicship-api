import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IContext } from "@/types/server";
import { userAuthInclude, userAuthSelect } from "@/application/domain/account/user/data/type";
import { createLoaders, Loaders } from "@/presentation/graphql/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { auth } from "@/infrastructure/libs/firebase";

function getIdTokenFromRequest(req: http.IncomingMessage): string | undefined {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer\s+/, "");
}

export async function createContext({ req }: { req: http.IncomingMessage }): Promise<IContext> {
  const issuer = new PrismaClientIssuer();
  const loaders: Loaders = createLoaders(issuer);
  const idToken = getIdTokenFromRequest(req);
  
  const phoneAuthToken = req.headers['x-phone-auth-token'] as string || '';
  const phoneRefreshToken = req.headers['x-phone-refresh-token'] as string || '';

  if (!idToken) {
    return { issuer, loaders, phoneAuthToken, phoneRefreshToken };
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
      uid,
      tenantId,
      platform,
      currentUser,
      hasPermissions,
      loaders,
      issuer,
      phoneAuthToken,
      phoneRefreshToken,
    };
  } catch (e) {
    return { issuer, loaders, phoneAuthToken, phoneRefreshToken };
  }
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}
