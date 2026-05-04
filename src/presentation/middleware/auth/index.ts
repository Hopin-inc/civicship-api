import { Request } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { extractAuthHeaders } from "@/presentation/middleware/auth/extract-headers";
import { handleFirebaseAuth } from "@/presentation/middleware/auth/firebase-auth";
import logger from "@/infrastructure/logging";
import { trace, context } from "@opentelemetry/api";
import { runRequestSecurityChecks } from "@/presentation/middleware/auth/security";

function isGraphQLBody(
  body: unknown,
): body is { operationName?: string; query?: string } {
  return typeof body === "object" && body !== null;
}

async function createContext({ req }: { req: Request }): Promise<IContext> {
  const currentSpan = trace.getSpan(context.active());
  const traceId = currentSpan?.spanContext().traceId;

  if (currentSpan && isGraphQLBody(req.body)) {
    const { operationName, query } = req.body;
    if (operationName) {
      currentSpan.setAttribute("app.graphql.operation.name", operationName);
    }
    if (query) {
      const operationType = query.trim().split(/\s+/)[0].toLowerCase();
      if (["query", "mutation", "subscription"].includes(operationType)) {
        currentSpan.setAttribute("app.graphql.operation.type", operationType);
      }
    }
  }

  logger.debug("🔍 [TRACE] GraphQL context creation (Express entry)", {
    traceId,
    path: req.url,
  });

  const headers = extractAuthHeaders(req);

  // Create a single PrismaClientIssuer instance to be used in both auth flows
  const issuer = new PrismaClientIssuer();

  // Pass the issuer to runRequestSecurityChecks for potential admin auth
  const adminContext = await runRequestSecurityChecks(req, headers, issuer);
  if (adminContext) return adminContext;

  // Use the same issuer for Firebase auth if admin auth didn't handle the request
  return await handleFirebaseAuth(headers, issuer);
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}
