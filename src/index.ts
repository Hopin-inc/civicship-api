import { createServer } from "https";
import fs from "fs";
import app from "@/server/app";
import { startApolloServer, graphqlServer, httpServer } from "@/server/graphql";
import { authHandler } from "@/middleware/auth";
import logger from "@/libs/logger";

const port = Number(process.env.PORT ?? 3000);

const startServer = async () => {
  // Apollo Server を起動
  await startApolloServer();

  // GraphQL ルートに認証ミドルウェアを追加（Apollo Server のインスタンスが必要）
  app.use("/graphql", authHandler(graphqlServer));

  // HTTPS 環境の場合は createServer を利用
  let server;
  if (process.env.NODE_HTTPS === "true") {
    server = createServer(
      {
        key: fs.readFileSync("./certificates/localhost-key.pem"),
        cert: fs.readFileSync("./certificates/localhost.pem"),
      },
      app,
    );
  } else {
    // 通常は httpServer（app から生成したもの）または直接 app を利用
    server = httpServer || app;
  }

  // サーバーの起動
  server.listen(port, () => {
    const uri =
      process.env.ENV === "LOCAL"
        ? (process.env.NODE_HTTPS === "true" ? "https://" : "http://") + `localhost:${port}/graphql`
        : `${process.env.HOST}/graphql`;
    logger.info(`🚀 Server ready at ${uri}`);
    logger.info(`Environment ${process.env.ENV}`);
  });
};

startServer();
