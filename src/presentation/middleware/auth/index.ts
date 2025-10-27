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

  const headers = extractAuthHeaders(req);
  const adminResult = await handleAdminAccess(headers);
  if (adminResult) {
    logger.debug("🎯 Auth context created", { authBranch: "admin" });
    return adminResult;
  }

  return await handleFirebaseAuth(headers, issuer);
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}
