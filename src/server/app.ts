import express from "express";
import { json } from "express";
import { corsHandler } from "@/middleware/cors";
import { requestLogger } from "@/middleware/logger";
import logger from "@/libs/logger";

const app = express();

// 信頼プロキシの設定（必要に応じて）
app.set("trust proxy", 1);

// /graphql ルートに対して、JSON パーサーや CORS、リクエストログのミドルウェアを登録
app.use("/graphql", json({ limit: "50mb" }), corsHandler, requestLogger);

// Express のエラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  logger.error("Unhandled Express Error:", {
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
