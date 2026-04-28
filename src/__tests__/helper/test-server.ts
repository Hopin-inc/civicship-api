import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import { authZApolloPlugin } from "@graphql-authz/apollo-server-plugin";
import { rules } from "@/presentation/graphql/rules";
import express, { json } from "express";
import { GraphQLError } from "graphql";
import logger from "@/infrastructure/logging";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export async function createApolloTestServer(mockContext: Record<string, unknown>) {
  const app = express();

  const { default: schema } = await import("@/presentation/graphql/schema");
  const server = new ApolloServer<Record<string, unknown>>({
    schema,
    plugins: [
      authZApolloPlugin({
        rules,
        // 本番（presentation/graphql/server.ts）と同じ shape の processError を
        // 通す。ここを揃えないと authz 経路の構造化エラー（FORBIDDEN 等）が
        // 本番で INTERNAL_SERVER_ERROR に潰される退行を CI で検知できない。
        processError: (error: unknown): never => {
          if (error instanceof GraphQLError) {
            throw error;
          }
          throw error;
        },
      }),
    ],
    formatError: (err) => {
      const { message, locations, path } = err;
      const code = err.extensions?.code ?? "INTERNAL_SERVER_ERROR";
      if (code === "INTERNAL_SERVER_ERROR") {
        logger.error(`GraphQL Error: ${err.message}`, err);
      }
      return { message, locations, path, code };
    },
  });

  await server.start();

  app.use(
    "/graphql",
    json(),
    expressMiddleware(server, {
      context: async () => {
        const issuer = new PrismaClientIssuer();
        const mockLoaders = {
          user: {
            load: jest.fn().mockResolvedValue({ id: "user-2", name: "Test User" }),
          },
          community: {
            load: jest.fn().mockResolvedValue({ id: "community-1", name: "Test Community" }),
          },
          membershipHistoriesByMembership: {
            load: jest.fn().mockResolvedValue([]),
          },
        };
        return {
          issuer,
          loaders: mockLoaders,
          ...mockContext,
        };
      },
    }),
  );

  return app;
}
