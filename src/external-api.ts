import "reflect-metadata";
import "@/application/provider";
import http from "http";
import express from "express";
import cors from "cors";
import logger from "@/infrastructure/logging";
import walletRouter from "@/presentation/router/wallet";
import nftTokenRouter from "@/presentation/router/nft-token";
import nftInstanceRouter from "@/presentation/router/nft-instance";
import { requestLogger } from "@/presentation/middleware/logger";

const port = Number(process.env.PORT ?? 3000);

async function startExternalApiServer() {
  const app = express();
  app.set("trust proxy", 1);

  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(requestLogger);

  app.use("/api", walletRouter);
  app.use("/api", nftTokenRouter);
  app.use("/api", nftInstanceRouter);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", service: "external-api" });
  });

  // Express の error-handling middleware は router 群より後に登録しないと
  // next(err) が伝播せず捕捉されない。req.body は次のレスポンスへ漏らさないよう
  // 短く要約のみ残す (PII / API key 等が含まれうるため)。
  app.use((err, req, res, _next) => {
    logger.error("External API Error:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
    res.status(500).json({ error: "Internal Server Error" });
  });

  server.listen(port, () => {
    logger.info(`🌐 External API Server ready at http://localhost:${port}`);
  });
}

startExternalApiServer();
