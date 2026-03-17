import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { extractAuthHeaders } from "@/presentation/middleware/auth/extract-headers";
import { handleFirebaseAuth } from "@/presentation/middleware/auth/firebase-auth";
import logger from "@/infrastructure/logging";
import { trace, context } from "@opentelemetry/api";
import { runRequestSecurityChecks } from "@/presentation/middleware/auth/security";
import express from "express";

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
    path: (req as any).url,
  });

  const headers = extractAuthHeaders(req);

  // Create a single PrismaClientIssuer instance to be used in both auth flows
  const issuer = new PrismaClientIssuer();

  // Pass the issuer to runRequestSecurityChecks for potential admin auth
  const adminContext = await runRequestSecurityChecks(req, headers, issuer);
  if (adminContext) return adminContext;

  // Use the same issuer for Firebase auth if admin auth didn't handle the request
  const result = await handleFirebaseAuth(headers, issuer);

  // Store clearSessionCookie flag on req so the wrapper middleware can set the header
  if (result.clearSessionCookie) {
    (req as any).__clearSessionCookie = result.clearSessionCookie;
  }

  return result;
}

export function authHandler(server: ApolloServer<IContext>) {
  const gqlMiddleware = expressMiddleware(server, { context: createContext });

  // Middleware that clears stale session cookies (e.g. deleted Firebase user)
  // after the GraphQL response is prepared but before it's sent.
  const clearCookieMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const originalEnd = res.end.bind(res);
    (res.end as any) = function (...args: any[]) {
      const cookieName = (req as any).__clearSessionCookie;
      if (cookieName) {
        res.clearCookie(cookieName, { path: "/", secure: true, sameSite: "none", httpOnly: true });
      }
      return (originalEnd as any)(...args);
    };
    next();
  };

  return [clearCookieMiddleware, gqlMiddleware];
}
