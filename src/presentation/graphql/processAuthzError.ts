import { GraphQLError } from "graphql";
import { UnauthorizedError } from "@graphql-authz/core";
import logger from "@/infrastructure/logging";

const isProductionDefault = process.env.NODE_ENV === "production";

/**
 * `@graphql-authz` plugin's `processError` hook.
 *
 * Three cases, in order:
 *
 * 1. `GraphQLError` 派生 (ApolloError / AuthorizationError / NotFoundError /
 *    ValidationError 等) → そのまま再throw。クライアント向け構造化 code
 *    (FORBIDDEN / UNAUTHENTICATED / NOT_FOUND / VALIDATION_ERROR) を保つ。
 *
 * 2. `UnauthorizedError` (graphql-authz 本体が rule 失敗時に投げる型。
 *    `preExecRule({ error: new AuthorizationError(...) })` のような用法でも
 *    `prepareError` が中身を `UnauthorizedError` でラップするため、ルール
 *    失敗は実質ここに着地する) → `code: FORBIDDEN` の GraphQLError に変換。
 *    プラグインのデフォルト `processError` と同じ挙動なので、authz テスト
 *    (`__tests__/auth/`) の "FORBIDDEN" 期待をそのまま満たす。
 *
 * 3. それ以外 (Prisma 素エラー, TypeError, ...) → 本番では原型を
 *    `logger.error` で記録した上で `INTERNAL_SERVER_ERROR` の GraphQLError
 *    に包んで内部情報を漏らさない (errorMiddleware の "Unhandled resolver
 *    error" と同じ作法)。formatError 経由で `code` ベースに包むより、ここで
 *    GraphQLError として throw した方が `extensions.code` が確実に乗る。
 *    非本番では原因切り分けのため原型のまま throw。
 *
 * 元実装が本番で全エラーを `Error("Internal Server Error")` に置き換え、
 * authz ルール失敗まで HTTP 500 + INTERNAL_SERVER_ERROR で返していた回帰
 * (PR #935) を修正するための関数。エクスポートしているのは単体テストで
 * 契約を固定するため (`__tests__/unit/middleware/processError.test.ts`)。
 */
export function processAuthzError(
  error: unknown,
  isProd: boolean = isProductionDefault,
): never {
  if (error instanceof GraphQLError) {
    throw error;
  }

  if (error instanceof UnauthorizedError) {
    throw new GraphQLError(error.message, {
      extensions: { code: "FORBIDDEN" },
    });
  }

  if (!isProd) {
    throw error;
  }

  // 本番で予期せぬ非 GraphQLError が来た場合、formatError 側に到達するまでの
  // 間に原型 (Prisma 例外 / TypeError 等) を失わないよう、ここで原型を ERROR
  // severity に積んでから INTERNAL_SERVER_ERROR の GraphQLError に包み直す。
  logger.error("Unhandled authz plugin error", error);

  throw new GraphQLError("Internal Server Error", {
    extensions: { code: "INTERNAL_SERVER_ERROR" },
  });
}
