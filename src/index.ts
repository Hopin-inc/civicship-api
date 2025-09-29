import "reflect-metadata";
import "@/application/provider";
import http from "http";
import { createServer } from "https";
import fs from "fs";
import { createApolloServer } from "@/presentation/graphql/server";
import logger from "@/infrastructure/logging";
import { authHandler } from "@/presentation/middleware/auth";
import lineRouter from "@/presentation/router/line";
import nmkrRouter from "@/presentation/router/nmkr";
import stripeRouter from "@/presentation/router/stripe";
import { batchProcess } from "@/batch";
import express from "express";
import { corsHandler } from "@/presentation/middleware/cors";
import { requestLogger } from "@/presentation/middleware/logger";
import { tokenUpdaterMiddleware } from "@/presentation/middleware/token-updater";
import { customProcessRequest } from "@/presentation/middleware/custom-process-request";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

const port = Number(process.env.PORT ?? 3000);

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);

  let server: http.Server;
  if (process.env.NODE_HTTPS === "true") {
    server = createServer(
      {
        key: fs.readFileSync("./certificates/localhost-key.pem"),
        cert: fs.readFileSync("./certificates/localhost.pem"),
      },
      app,
    );
  } else {
    server = http.createServer(app);
  }

  const apolloServer = await createApolloServer(server);

  app.use(corsHandler);
  app.use("/stripe", stripeRouter);
  app.use(express.json({ limit: "50mb" }));
  app.use(requestLogger);
  app.use(tokenUpdaterMiddleware);
  app.use(
    graphqlUploadExpress({
      maxFileSize: 10_000_000,
      maxFiles: 10,
      processRequest: customProcessRequest,
    }),
  );

  app.use((err, req, res, _next) => {
    logger.error("Unhandled Express Error:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.use("/graphql", authHandler(apolloServer), tokenUpdaterMiddleware);
  app.use("/line", lineRouter);
  app.use("/nmkr", nmkrRouter);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", service: "internal-api" });
  });

  server.listen(port, () => {
    const protocol = process.env.NODE_HTTPS === "true" ? "https" : "http";
    const host = "localhost";
    const url = `${protocol}://${host}:${port}/graphql`;

    logger.info(`🚀 Server ready at ${url}`);
  });
}

async function main() {
  if (process.env.PROCESS_TYPE === "batch") {
    logger.info(`Batch process started: ${process.env.BATCH_PROCESS_NAME}`);
    await batchProcess();
    logger.info(`Batch process completed: ${process.env.BATCH_PROCESS_NAME}`);
    if (process.env.ENV === "LOCAL") {
      process.exit(0);
    }
  } else {
    await startServer();
  }
}

main();
