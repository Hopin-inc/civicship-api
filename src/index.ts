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

  app.use(express.json({ limit: "50mb" }), corsHandler, requestLogger);
  app.use((err, _req, res, _next) => {
    logger.error("Unhandled Express Error:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.use("/graphql", authHandler(apolloServer));
  app.use("/line", lineRouter);
  server.listen(port, () => {
    const protocol = process.env.NODE_HTTPS === "true" ? "https" : "http";
    const host = "localhost";
    const url = `${protocol}://${host}:${port}/graphql`;

    logger.info(`🚀 Server ready at ${url}`);
  });
}

async function main() {
  if (process.env.PROCESS_TYPE === "batch") {
    await batchProcess();
  } else {
    await startServer();
  }
}

main();
