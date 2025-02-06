import depthLimit from "graphql-depth-limit";
import createComplexityRule, { simpleEstimator } from "graphql-query-complexity";
import { GraphQLError } from "graphql/error";

export const depthRule = depthLimit(7);

export const complexityRule = createComplexityRule({
  maximumComplexity: 200,
  variables: {},
  createError: (max, actual) => {
    return new GraphQLError(`Query is too complex: ${actual}. Max allowed: ${max}`, {
      extensions: {
        code: "QUERY_COMPLEXITY_ERROR",
        actual,
        max,
      },
    });
  },
  estimators: [simpleEstimator({ defaultComplexity: 1 })],
});
