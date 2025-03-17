import { ApolloServerPlugin, GraphQLRequestContext } from "@apollo/server";
import { getComplexity, directiveEstimator, simpleEstimator } from "graphql-query-complexity";
import { GraphQLError } from "graphql/error";
import type { IContext } from "@/types/server";
import logger from "@/infra/logging";
import {
  DEFAULT_COMPLEXITY,
  MAX_COMPLEXITY_PER_MINUTE,
  MAX_COMPLEXITY_PER_USAGE,
} from "@/consts/graphql";
import { RateLimitError } from "@/errors/graphql";

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

        if (complexity > MAX_COMPLEXITY_PER_MINUTE) {
          throw new RateLimitError("Query complexity limit reached");
        }
      },
    };
  },
};

export default rateLimitPlugin;
