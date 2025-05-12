import { ApolloServer } from "@apollo/server";
import logger from "@/infrastructure/logging";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
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
    formatError: (err, error) => {
      const { message, locations, path } = err;
      const code = err.extensions?.code ?? "INTERNAL_SERVER_ERROR";

      try {
        const originalError = (error as any)?.originalError;
        const res = (originalError as any)?.res;
        const req = (originalError as any)?.req;
        const origin = req?.headers?.origin;
        const allowed = (process.env.ALLOWED_ORIGINS ?? "").split(" ");

        if (res?.setHeader && origin && allowed.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Access-Control-Allow-Credentials", "true");
        }
      } catch {
        // 念のため握りつぶしておく
      }

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
