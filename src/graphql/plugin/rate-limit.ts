import Redis from "ioredis";
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from "graphql-query-complexity";
import { ApolloServerPlugin, GraphQLRequestContext } from "@apollo/server";
import type { DocumentNode, GraphQLSchema } from "graphql";
import type { IContext, LoggedInUserInfo } from "@/types/server";
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
        const { schema } = ctx;
        const complexity = getQueryComplexity(schema, ctx.document);
        console.log(`Calculated query complexity: ${complexity}`);

        const clientIdentifier = getClientIdentifier(ctx);
        const redisKey = `rate_limit:${clientIdentifier}`;
        await updateRateLimit(redisKey, complexity);
      },
    };
  },
};

/**
 * GraphQL の DocumentNode が Introspection クエリかどうか判定する
 */
function isIntrospectionQuery(document: DocumentNode): boolean {
  return document.definitions.some((def) => {
    if (def.kind !== "OperationDefinition") return false;
    return def.selectionSet.selections.some(
      (selection) =>
        selection.kind === "Field" &&
        (selection.name.value === "__schema" || selection.name.value === "__type"),
    );
  });
}

/**
 * オブジェクトが uid プロパティを持っているか判定する型ガード
 */
function hasUidProperty(obj: unknown): obj is { uid: unknown } {
  return typeof obj === "object" && obj !== null && "uid" in obj;
}

/**
 * コンテキストが LoggedInUserInfo であるか判定する型ガード
 */
function isLoggedInUserInfo(context: IContext): context is LoggedInUserInfo {
  return hasUidProperty(context) && true;
}

/**
 * クライアントの識別子を取得する関数
 * - Introspection クエリの場合は固定 "introspection" を返す
 * - ログイン済みの場合は uid を利用
 * - 未ログインの場合は HTTP ヘッダーの x-forwarded-for を利用
 */
function getClientIdentifier(ctx: GraphQLRequestContext<IContext>): string {
  if (ctx.document && isIntrospectionQuery(ctx.document)) {
    return "introspection";
  }

  const contextValue = ctx.contextValue;
  if (isLoggedInUserInfo(contextValue) && contextValue.uid.trim() !== "") {
    return contextValue.uid;
  }

  if (!ctx.request.http) {
    throw new Error("No HTTP request info available");
  }

  // まずは通常の x-forwarded-for ヘッダーから取得
  const ip = ctx.request.http.headers.get("x-forwarded-for");
  if (ip) {
    return ip;
  }

  // ヘッダーが存在しない場合、開発環境なら代替手段として remoteAddress を利用する
  if (process.env.ENV === "LOCAL") {
    const remoteAddress = (ctx.request.http as any).socket?.remoteAddress;
    if (remoteAddress) {
      return remoteAddress;
    }
    // remoteAddress が取れない場合は、デフォルト値を返す（必要に応じて変更）
    return "127.0.0.1";
  }

  throw new Error("Unable to determine client IP address");
}

/**
 * クエリの複雑度を計算する関数
 */
function getQueryComplexity(schema: GraphQLSchema, document: DocumentNode | undefined): number {
  if (!document) {
    throw new Error("GraphQL document is undefined");
  }

  return getComplexity({
    schema,
    query: document,
    variables: {},
    estimators: [
      fieldExtensionsEstimator(),
      simpleEstimator({
        defaultComplexity: DEFAULT_COMPLEXITY,
      }),
    ],
  });
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
