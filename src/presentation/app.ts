import express from "express";
import { corsHandler } from "@/presentation/middleware/cors";
import { requestLogger } from "@/presentation/middleware/logger";
import logger from "@/infrastructure/logging";

export function createExpressApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use("/graphql", express.json({ limit: "50mb" }), corsHandler, requestLogger);

  app.use((err, req, res, next) => {
    logger.error("Unhandled Express Error:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
