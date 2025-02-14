import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { addResolversToSchema } from "@graphql-tools/schema";
import schema from "@/graphql/schema";
import resolvers from "@/graphql/resolvers";
import { specifiedRules } from "graphql/validation";
import { complexityRule } from "@/graphql/validation";
import { applyMiddleware } from "graphql-middleware";
import errorMiddleware from "@/middleware/error";
import logger from "@/libs/logger";
import http from "http";
import app from "@/server/app";
import rateLimitPlugin from "@/graphql/plugin/rate-limit";

const isProduction = process.env.NODE_ENV === "production";

// Express アプリから HTTP サーバーを生成
const httpServer = http.createServer(app);

// スキーマとリゾルバをマージし、必要なミドルウェアを適用
const mergedSchema = applyMiddleware(addResolversToSchema({ schema, resolvers }), errorMiddleware);

// Apollo Server の生成
export const graphqlServer = new ApolloServer({
  schema: mergedSchema,
  validationRules: [...specifiedRules, complexityRule],
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), rateLimitPlugin],
  // GraphQL のエラーをログ出力
  formatError: (err) => {
    logger.error("GraphQL Error:", err);
    return err;
  },
  introspection: !isProduction,
});

// Apollo Server の起動処理（非同期）
export const startApolloServer = async () => {
  await graphqlServer.start();
  return graphqlServer;
};

export { httpServer };
