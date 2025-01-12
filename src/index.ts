import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { addResolversToSchema } from "@graphql-tools/schema";
import { createServer } from "https";
import fs from "fs";
import schema from "@/graphql/schema";
import resolvers from "@/graphql/resolvers";
import { IContext } from "@/types/server";
import { requestLogger } from "@/middleware/logger";
import { authHandler } from "@/middleware/auth";
import { corsHandler } from "@/middleware/cors";
import { applyMiddleware } from "graphql-middleware";
import errorMiddleware from "@/middleware/error";
import logger from "./libs/logger";

const isLocal = process.env.ENV === "LOCAL"
process.env.NODE_ENV = isLocal ? "development" : "production"

const app = express();
const httpServer = http.createServer(app);

// TODO delete Field suggestion on prd
const mergedSchema = applyMiddleware(
  addResolversToSchema({ schema, resolvers }),
  errorMiddleware,
);
const graphqlServer = new ApolloServer<IContext>({
  schema: mergedSchema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
  ],
  // handle Apollo server error (GraphQL error)
  formatError: (err) => {
    logger.error("GraphQL Error:", err);
    return err;
  },
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

// handle express error
app.use((err: Error, req, res, next) => {
  logger.error("Unhandled Express Error:", {
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ error: "Internal Server Error" });
});

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
  logger.info(`🚀 Server ready at ${uri}`);
  logger.info(`Environment ${process.env.ENV}`);
});
