import Redis from "ioredis";
import { directiveEstimator, getComplexity, simpleEstimator } from "graphql-query-complexity";
import { ApolloServerPlugin, GraphQLRequestContext } from "@apollo/server";
import type { IContext } from "@/types/server";
import {
  DEFAULT_COMPLEXITY,
  MAX_COMPLEXITY_PER_MINUTE,
  RATE_LIMIT_SECONDS,
} from "@/consts/graphql";

const redis = new Redis();

/**
 * Apollo Server 用のレートリミットプラグイン（クエリ複雑度ベース）
 */
const rateLimitPlugin: ApolloServerPlugin<IContext> = {
  async requestDidStart(requestContext: GraphQLRequestContext<IContext>) {
    void requestContext;
    return {
      async didResolveOperation(ctx: GraphQLRequestContext<IContext>) {
        if (!ctx.document) {
          throw new Error("GraphQL document is undefined");
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
        console.log(`Calculated query complexity: ${complexity}`);

        const clientIdentifier = getClientIdentifier(ctx);
        const redisKey = `rate_limit:${clientIdentifier}`;
        await updateRateLimit(redisKey, complexity);
      },
    };
  },
};

/** context から uid を取り出す */
function extractUid(context: IContext): string | null {
  if (typeof context === "object" && context !== null && "uid" in context) {
    return context.uid;
  }
  return null;
}

/** クライアントの識別子を取得する関数 */
function getClientIdentifier(ctx: GraphQLRequestContext<IContext>): string {
  if (process.env.ENV === "LOCAL") {
    return "3000";
  }
  const uid = extractUid(ctx.contextValue);
  if (uid?.trim()) {
    return uid;
  }

  if (!ctx.request.http) {
    throw new Error("No HTTP request info available");
  }
  const ip = ctx.request.http.headers.get("x-forwarded-for");
  if (ip) {
    return ip;
  }
  throw new Error("Unable to determine client IP address");
}

/**
 * Redis 上のレートリミットを更新する関数
 */
async function updateRateLimit(redisKey: string, complexity: number): Promise<void> {
  const currentUsageStr = await redis.get(redisKey);
  const currentUsage = parseInt(currentUsageStr || "0", 10);
  if (currentUsage + complexity > MAX_COMPLEXITY_PER_MINUTE) {
    throw new Error("Rate limit exceeded: query complexity limit reached for this time window");
  }
  await redis.incrby(redisKey, complexity);
  // 新規キーの場合は TTL を 60 秒に設定
  if (currentUsage === 0) {
    await redis.expire(redisKey, RATE_LIMIT_SECONDS);
  }
}

export default rateLimitPlugin;
