import "reflect-metadata";
import "@/application/provider";
import http from "http";
import express from "express";
import cors from "cors";
import logger from "@/infrastructure/logging";
import walletRouter from "@/presentation/router/wallet";
import { requestLogger } from "@/presentation/middleware/logger";

const port = Number(process.env.PORT ?? 3000);

async function startExternalApiServer() {
  const app = express();
  app.set("trust proxy", 1);

  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(requestLogger);

  app.use((err, req, res, _next) => {
    logger.error("External API Error:", {
      message: err.message,
      stack: err.stack,
      req: {
        body: req.body,
      },
    });
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.use("/api", walletRouter);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", service: "external-api" });
  });

  server.listen(port, () => {
    logger.info(`🌐 External API Server ready at http://localhost:${port}`);
  });
}

startExternalApiServer();
