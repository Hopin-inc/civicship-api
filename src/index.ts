import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { addResolversToSchema } from "@graphql-tools/schema";
import { createServer } from "https";
import fs from "fs";
import schema from "@/graphql/schema/";
import resolvers from "@/graphql/resolvers";
import { IContext } from "@/types/server";
import { requestLogger } from "@/middleware/logger";
import { authHandler } from "@/middleware/auth";
import { corsHandler } from "@/middleware/cors";

const app = express();
const httpServer = http.createServer(app);

// TODO delete Field suggestion on prd
const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
const graphqlServer = new ApolloServer<IContext>({
  schema: schemaWithResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await graphqlServer.start();

app.set("trust proxy", 1);
app.use(
  "/graphql",
  express.json({ limit: "50mb" }),
  corsHandler,
  requestLogger,
  authHandler(graphqlServer),
);

const port = Number(process.env.PORT ?? 3000);
const server =
  process.env.NODE_HTTPS === "true"
    ? createServer(
      {
        key: fs.readFileSync("./certificates/localhost-key.pem"),
        cert: fs.readFileSync("./certificates/localhost.pem"),
      },
      app,
    )
    : app;
server.listen(port, () => {
  const uri =
    process.env.ENV === "LOCAL"
      ? (process.env.NODE_HTTPS === "true" ? "https://" : "http://") + `localhost:${port}/graphql`
      : `${process.env.HOST}/graphql`;
  console.info(`🚀 Server ready at ${uri}`);
  console.info(`Environment ${process.env.ENV}`);
});
