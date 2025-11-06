import { ApolloServer } from "@apollo/server";
import logger from "@/infrastructure/logging";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginUsageReporting } from "@apollo/server/plugin/usageReporting";
import http from "http";
import schema from "@/presentation/graphql/schema";
import { authZApolloPlugin } from "@graphql-authz/apollo-server-plugin";
import { rules } from "@/presentation/graphql/rule";
import { armorProtection } from "@/presentation/graphql/plugins/armor";

const isProduction = process.env.NODE_ENV === "production";

export async function createApolloServer(httpServer: http.Server) {
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginUsageReporting({
        fieldLevelInstrumentation: isProduction ? 0.02 : 1.0,
        sendReportsImmediately: !isProduction,
      }),
      ApolloServerPluginDrainHttpServer({ httpServer }),
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
