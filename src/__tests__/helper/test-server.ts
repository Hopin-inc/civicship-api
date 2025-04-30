import express, { json } from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";

export async function createApolloTestServer(mockContext: any) {
  const app = express();

  const { default: schema } = await import("@/presentation/graphql/schema");
  const server = new ApolloServer<any>({ schema });

  await server.start();

  app.use(
    "/graphql",
    json(),
    expressMiddleware(server, {
      context: async () => mockContext,
    }),
  );

  return app;
}
