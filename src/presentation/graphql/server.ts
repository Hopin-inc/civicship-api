import { ApolloServer } from "@apollo/server";
import logger from "@/infrastructure/logging";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginUsageReporting } from "@apollo/server/plugin/usageReporting";
import { GraphQLError } from "graphql";
import http from "http";
import schema from "@/presentation/graphql/schema";
import { authZApolloPlugin } from "@graphql-authz/apollo-server-plugin";
import { rules } from "@/presentation/graphql/rules";
import { armorProtection } from "@/presentation/graphql/plugins/armor";

const isProduction = process.env.NODE_ENV === "production";
// LOCAL_DEV is injected by `pnpm dev*` scripts so that running locally against
// a remote env (`dev:https:dev` / `dev:https:prd`) does not activate Apollo
// usage reporting, which would otherwise leak local traffic or fail at startup
// when APOLLO_KEY is unset.
const isLocal = process.env.ENV === "LOCAL" || process.env.LOCAL_DEV === "true";

export async function createApolloServer(httpServer: http.Server) {
  const plugins = [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ...armorProtection.plugins,
    authZApolloPlugin({
      rules,
      processError: (error: unknown): never => {
        // ApolloError 派生（FORBIDDEN / UNAUTHENTICATED / NOT_FOUND / VALIDATION_ERROR
        // ...）はクライアント向けの構造化エラーなので、本番でも握り潰さずに通す。
        // ここで Error("Internal Server Error") に置き換えると authz ルール失敗が
        // HTTP 500 + INTERNAL_SERVER_ERROR で返り、フロントが認可拒否と本物の障害
        // を区別できなくなる。
        if (error instanceof GraphQLError) {
          throw error;
        }
        if (!isProduction) {
          throw error;
        }
        throw new Error("Internal Server Error");
      },
    }),
  ];

  if (!isLocal) {
    plugins.unshift(
      ApolloServerPluginUsageReporting({
        fieldLevelInstrumentation: isProduction ? 0.05 : 1.0,
        sendReportsImmediately: !isProduction,
        sendVariableValues: { none: true },
        includeRequest: async (requestContext) => {
          const headerValue = requestContext.request.http?.headers.get("x-no-report");
          return headerValue !== "true";
        },
      }),
    );
  }

  const server = new ApolloServer({
    schema,
    plugins,
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
