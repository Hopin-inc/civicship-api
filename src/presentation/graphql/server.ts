import { ApolloServer } from "@apollo/server";
import rateLimitPlugin from "@/presentation/graphql/plugin";
import logger from "@/infrastructure/logging";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import schema from "@/presentation/graphql/schema";

const isProduction = process.env.NODE_ENV === "production";

export async function createApolloServer(httpServer: http.Server) {
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), rateLimitPlugin],
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
