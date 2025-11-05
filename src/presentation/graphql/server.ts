import { ApolloServer } from "@apollo/server";
import logger from "@/infrastructure/logging";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import schema from "@/presentation/graphql/schema";
import { authZApolloPlugin } from "@graphql-authz/apollo-server-plugin";
import { rules } from "@/presentation/graphql/rule";
import { armorProtection } from "@/presentation/graphql/plugins/armor";
import { createPerfPlugin } from "@/presentation/graphql/plugins/perfPlugin";
import { createApolloCache } from "@/presentation/graphql/cache";
import { createResponseCachePlugin } from "@/presentation/graphql/plugins/responseCachePlugin";

const isProduction = process.env.NODE_ENV === "production";

export async function createApolloServer(httpServer: http.Server) {
  const cache = createApolloCache();

  const server = new ApolloServer({
    schema,
    cache,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      createPerfPlugin(),
      createResponseCachePlugin(),
      ...armorProtection.plugins,
      authZApolloPlugin({
        rules,
        processError: (error: unknown): never => {
          if (!isProduction) {
            throw error;
          }
          throw new Error("Internal Server Error");
        },
      }),
    ],
    validationRules: [...armorProtection.validationRules],
    formatError: (err) => {
      const { message, locations, path, extensions } = err;
      const code = extensions?.code ?? "INTERNAL_SERVER_ERROR";

      if (code === "INTERNAL_SERVER_ERROR") {
        logger.error(`GraphQL Error: ${message}`, err);
      }

      return {
        message,
        locations,
        path,
        extensions: {
          code,
        },
      };
    },

    introspection: !isProduction,
  });

  await server.start();
  return server;
}
