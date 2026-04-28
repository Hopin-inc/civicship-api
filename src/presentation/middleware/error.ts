import { GraphQLError } from "graphql/error";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";
import { GraphQLResolveInfo } from "graphql";

const errorMiddleware = async <TSource = unknown, TArgs = unknown>(
  resolve: (
    parent?: TSource,
    args?: TArgs,
    context?: IContext,
    info?: GraphQLResolveInfo,
  ) => Promise<unknown>,
  parent: TSource,
  args: TArgs,
  context: IContext,
  info: GraphQLResolveInfo,
) => {
  try {
    return await resolve(parent, args, context, info);
  } catch (error) {
    if (error instanceof GraphQLError) {
      // クライアント向けの構造化エラー（NotFoundError / ValidationError /
      // AuthorizationError 等）は code を保ったまま再throw。
      // INTERNAL_SERVER_ERROR の出力時ログは formatError 側 (graphql/server.ts)
      // で一元化しているので、ここで重ねてログしない。
      throw error;
    }

    // 想定外（Prisma の素エラー、TypeError 等）はここで握って ERROR severity
    // で記録した上で、INTERNAL_SERVER_ERROR として包んで返す。
    logger.error("Unhandled resolver error", error);

    throw new GraphQLError("Internal Server Error", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }
};

export default errorMiddleware;
