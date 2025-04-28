import http from "http"; // ★追加
import jwt from "jsonwebtoken";
import express from "express";
import { createApolloServer } from "@/presentation/graphql/server";
import { corsHandler } from "@/presentation/middleware/cors";
import { requestLogger } from "@/presentation/middleware/logger";
import { authHandler } from "@/presentation/middleware/auth";

export async function createTestApp() {
  const app = express();
  app.set("trust proxy", 1);

  // ★ テスト用ダミーサーバーを作る
  const dummyServer = http.createServer(app);

  const apolloServer = await createApolloServer(dummyServer);

  app.use(express.json({ limit: "50mb" }), corsHandler, requestLogger);
  app.use("/graphql", authHandler(apolloServer));

  return app;
}

export const issueTestToken = (userId: string) => {
  const payload = {
    sub: userId,
    type: "user",
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.sign(payload, secret, {
    expiresIn: "1h",
    algorithm: "HS256",
  });
};
