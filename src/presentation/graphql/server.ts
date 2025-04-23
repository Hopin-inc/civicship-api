import { ApolloServer } from "@apollo/server";
import rateLimitPlugin from "@/presentation/graphql/plugins/rateLimit";
import logger from "@/infrastructure/logging";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import schema from "@/presentation/graphql/schema";
import { authZApolloPlugin } from "@graphql-authz/apollo-server-plugin";
import { rules } from "@/presentation/graphql/rule";
import debugLogger from "@/presentation/graphql/plugins/debugLogger";

const isProduction = process.env.NODE_ENV === "production";

export async function createApolloServer(httpServer: http.Server) {
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      rateLimitPlugin,
      authZApolloPlugin({
        rules,
        processError: (error: unknown): never => {
          if (!isProduction) {
            throw error;
          }
          throw new Error("Internal Server Error");
        },
      }),
      debugLogger,  // TODO: disable this in prod environment
    ],
    formatError: (err) => {
      const { message, locations, path } = err;
      const code = err.extensions?.code ?? "INTERNAL_SERVER_ERROR";
      if (code === "INTERNAL_SERVER_ERROR") {
        logger.error(`GraphQL Error: ${err.message}`, err);
      }
      return { message, locations, path, code };
    },
    introspection: !isProduction,
  });

  await server.start();
  return server;
}
