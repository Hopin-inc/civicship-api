import Redis from "ioredis";
import { ApolloServerPlugin, GraphQLRequestContext } from "@apollo/server";
import { getComplexity, directiveEstimator, simpleEstimator } from "graphql-query-complexity";
import { GraphQLError } from "graphql/error";
import type { IContext } from "@/types/server";
import logger from "@/infra/logging";
import {
  DEFAULT_COMPLEXITY,
  MAX_COMPLEXITY_PER_MINUTE,
  MAX_COMPLEXITY_PER_USAGE,
  RATE_LIMIT_SECONDS,
} from "@/consts/graphql";

const redis = new Redis();

/**
 * Apollo Server 用のレートリミットプラグイン（クエリ複雑度ベース）
 * クエリ実行時に `didResolveOperation` フックで複雑度を計算し、制限を超えていればエラーを返す。
 */
const rateLimitPlugin: ApolloServerPlugin<IContext> = {
  async requestDidStart() {
    return {
      async didResolveOperation(ctx: GraphQLRequestContext<IContext>) {
        if (!ctx.document) {
          throw new GraphQLError("GraphQL document is undefined");
        }

        const complexity = getComplexity({
          schema: ctx.schema,
          query: ctx.document,
          variables: ctx.request.variables,
          estimators: [
            directiveEstimator({ name: "complexity" }),
            simpleEstimator({
              defaultComplexity: DEFAULT_COMPLEXITY,
            }),
          ],
        });

        if (complexity > MAX_COMPLEXITY_PER_USAGE) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Max allowed: ${MAX_COMPLEXITY_PER_USAGE}`,
            {
              extensions: {
                code: "QUERY_COMPLEXITY_ERROR",
              },
            },
          );
        }

        logger.info(`Calculated query complexity: ${complexity}`);

        const clientIdentifier = getClientIdentifier(ctx);
        const redisKey = `rate_limit:${clientIdentifier}`;

        const currentUsageStr = await redis.get(redisKey);
        const currentUsage = parseInt(currentUsageStr || "0", 10);

        if (currentUsage + complexity > MAX_COMPLEXITY_PER_MINUTE) {
          throw new GraphQLError("Rate limit exceeded: query complexity limit reached.", {
            extensions: {
              code: "RATE_LIMIT_EXCEEDED",
            },
          });
        }

        await redis.incrby(redisKey, complexity);
        if (currentUsage === 0) {
          await redis.expire(redisKey, RATE_LIMIT_SECONDS);
        }
      },
    };
  },
};

export default rateLimitPlugin;

/**
 * クライアントの識別子を取得する関数。
 *  - ログインユーザーがいればその uid
 *  - いなければリクエスト IP
 */
function getClientIdentifier(ctx: GraphQLRequestContext<IContext>): string {
  if (process.env.ENV === "LOCAL") {
    return "local_dev_user";
  }

  const uid = extractUid(ctx.contextValue);
  if (uid?.trim()) {
    return uid;
  }

  const ip = ctx.request.http?.headers.get("x-forwarded-for");
  if (ip) {
    return ip;
  }

  throw new Error("Unable to determine client identifier");
}

/** context から uid を取り出す例 */
function extractUid(context: IContext): string | null {
  if (typeof context === "object" && context !== null && "uid" in context) {
    return context.uid ?? null;
  }
  return null;
}
