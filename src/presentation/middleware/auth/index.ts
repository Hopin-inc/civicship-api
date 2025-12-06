import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { extractAuthHeaders } from "@/presentation/middleware/auth/extract-headers";
import { handleAdminAccess } from "@/presentation/middleware/auth/admin-access";
import { handleFirebaseAuth } from "@/presentation/middleware/auth/firebase-auth";
import logger from "@/infrastructure/logging";
import { trace, context } from "@opentelemetry/api";

async function createContext({ req }: { req: http.IncomingMessage }): Promise<IContext> {
  const currentSpan = trace.getSpan(context.active());
  const traceId = currentSpan?.spanContext().traceId;
  
  if (currentSpan) {
    const body = (req as any).body;
    if (body?.operationName) {
      currentSpan.setAttribute("app.graphql.operation.name", body.operationName);
    }
    if (body?.query) {
      const operationType = body.query.trim().split(/\s+/)[0].toLowerCase();
      if (["query", "mutation", "subscription"].includes(operationType)) {
        currentSpan.setAttribute("app.graphql.operation.type", operationType);
      }
    }
  }
  
  logger.debug("🔍 [TRACE] GraphQL context creation (Express entry)", { 
    traceId,
    path: (req as any).url 
  });

  const issuer = new PrismaClientIssuer();

  const headers = extractAuthHeaders(req);
  const adminResult = await handleAdminAccess(headers);
  if (adminResult) {
    logger.debug("🎯 Auth context created", { authBranch: "admin" });
    return adminResult;
  }

  return await handleFirebaseAuth(headers, issuer, req);
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}
