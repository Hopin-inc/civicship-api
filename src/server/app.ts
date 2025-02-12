import express from "express";
import { corsHandler } from "@/middleware/cors";
import { requestLogger } from "@/middleware/logger";
import logger from "@/libs/logger";

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
