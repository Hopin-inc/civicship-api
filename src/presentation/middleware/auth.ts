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
  const idToken = getIdTokenFromRequest(req);

  if (!idToken) {
    return {};
  }

  const decoded = await auth.verifyIdToken(idToken);
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

  const loaders: Loaders = createLoaders(issuer);

  return {
    uid,
    platform,
    currentUser,
    hasPermissions,
    loaders,
  };
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}
