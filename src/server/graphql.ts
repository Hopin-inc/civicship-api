import { ApolloServer } from "@apollo/server";
import rateLimitPlugin from "@/graphql/plugin/rate-limit";
import logger from "@/libs/logger";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import schema from "@/graphql/schema";

const isProduction = process.env.NODE_ENV === "production";

export async function createApolloServer(httpServer: http.Server) {
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), rateLimitPlugin],
    formatError: (err) => {
      logger.error("GraphQL Error:", err);
      return err;
    },
    introspection: !isProduction,
  });

  await server.start();
  return server;
}
