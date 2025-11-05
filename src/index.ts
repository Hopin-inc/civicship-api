import "reflect-metadata";
import "@/application/provider";
import http from "http";
import { createServer } from "https";
import fs from "fs";
import { createApolloServer } from "@/presentation/graphql/server";
import logger from "@/infrastructure/logging";
import { authHandler } from "@/presentation/middleware/auth";
import lineRouter from "@/presentation/router/line";
import { batchProcess } from "@/batch";
import express from "express";
import { corsHandler } from "@/presentation/middleware/cors";
import { requestLogger } from "@/presentation/middleware/logger";
import { customProcessRequest } from "@/presentation/middleware/custom-process-request";
import { correlationMiddleware } from "@/presentation/middleware/correlation";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import cookieParser from "cookie-parser";
import { handleSessionLogin } from "@/presentation/middleware/session";
import { warmUpPrisma, checkDatabaseHealth } from "@/infrastructure/prisma/warmup";
import { setupGracefulShutdown } from "@/infrastructure/prisma/shutdown";
import compression from "compression";
import { filter as defaultCompressionFilter } from "compression";

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

  await warmUpPrisma();

  const apolloServer = await createApolloServer(server);

  app.use((req, res, next): void => {
    if (req.method === "TRACE") {
      logger.warn(`Blocked TRACE request: ${req.originalUrl}`);
      res.status(405).send("TRACE method not allowed");
      return;
    }
    next();
  });
  app.use(requestLogger);
  app.use(correlationMiddleware);

  app.use(corsHandler);
  
  app.use(compression({
    threshold: 1024,
    level: 6,
    filter: (req, res) => {
      const contentType = String(res.getHeader('Content-Type') || '');
      
      if (req.headers.accept?.includes('text/event-stream')) {
        return false;
      }
      
      if (/^(image|audio|video)\//i.test(contentType)) {
        return false;
      }
      if (/^application\/octet-stream/i.test(contentType)) {
        return false;
      }
      
      return defaultCompressionFilter(req, res);
    },
  }));
  
  app.use(express.json({ limit: "50mb" }));
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

  app.use(cookieParser());
  app.post("/sessionLogin", handleSessionLogin);

  app.use("/graphql", authHandler(apolloServer));
  app.use("/line", lineRouter);

  app.get("/health", async (req, res) => {
    const isHealthy = await checkDatabaseHealth();
    if (isHealthy) {
      res.status(200).json({ status: "healthy", service: "internal-api", db: "connected" });
    } else {
      res.status(503).json({ status: "unhealthy", service: "internal-api", db: "disconnected" });
    }
  });

  server.listen(port, () => {
    server.keepAliveTimeout = 65_000;  // 65 seconds (Portal's undici uses 60s)
    server.headersTimeout = 66_000;    // Must be > keepAliveTimeout
    server.requestTimeout = 30_000;    // 30 seconds

    const protocol = process.env.NODE_HTTPS === "true" ? "https" : "http";
    const host = "localhost";
    const url = `${protocol}://${host}:${port}/graphql`;

    logger.info(`🚀 Server ready at ${url}`);
  });

  setupGracefulShutdown(server);
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
