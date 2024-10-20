import { GraphQLError } from "graphql/error";
import logger from "@/libs/logger";
import { IContext } from "@/types/server";
import { GraphQLResolveInfo } from "graphql";

const errorMiddleware = async <TSource = unknown, TArgs = unknown>(
  resolve: (parent?: TSource, args?: TArgs, context?: IContext, info?: GraphQLResolveInfo) => Promise<unknown>,
  parent: TSource,
  args: TArgs,
  context: IContext,
  info: GraphQLResolveInfo,
) => {
  try {
    return await resolve(parent, args, context, info);
  } catch (error) {
    logger.error("Error caught:", error);
    throw new GraphQLError("Internal Server Error", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }
};

export default errorMiddleware;
