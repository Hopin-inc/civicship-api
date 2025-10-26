import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { extractAuthHeaders } from "@/presentation/middleware/auth/extract-headers";
import { handleAdminAccess } from "@/presentation/middleware/auth/admin-access";
import { handleFirebaseAuth } from "@/presentation/middleware/auth/firebase-auth";
import logger from "@/infrastructure/logging";

async function createContext({ req }: { req: http.IncomingMessage }): Promise<IContext> {
  const issuer = new PrismaClientIssuer();
  const flowId = (req.headers["x-flow-id"] as string) || "no-flow-id";

  logger.debug("🎯 Creating auth context", { flowId });

  const headers = extractAuthHeaders(req);
  const adminResult = await handleAdminAccess(headers);
  if (adminResult) {
    logger.debug("🎯 Auth context created", { flowId, authBranch: "admin" });
    return adminResult;
  }

  const firebaseResult = await handleFirebaseAuth(headers, issuer);
  const authBranch = firebaseResult.uid ? "firebase" : "anonymous";
  logger.debug("🎯 Auth context created", {
    flowId,
    authBranch,
    hasUid: !!firebaseResult.uid,
    hasCurrentUser: !!firebaseResult.currentUser,
  });

  return firebaseResult;
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}
