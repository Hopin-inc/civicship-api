import { GraphQLError } from "graphql";
import {
  createComplexityRule,
  directiveEstimator,
  simpleEstimator,
} from "graphql-query-complexity";
import { DEFAULT_COMPLEXITY, MAX_COMPLEXITY } from "@/consts/graphql";

export const complexityRule = createComplexityRule({
  maximumComplexity: MAX_COMPLEXITY,
  estimators: [
    directiveEstimator({ name: "complexity" }),
    simpleEstimator({
      defaultComplexity: DEFAULT_COMPLEXITY,
    }),
  ],
  createError: (max, actual) => {
    return new GraphQLError(`Query is too complex: ${actual}. Max allowed: ${max}`, {
      extensions: {
        code: "QUERY_COMPLEXITY_ERROR",
        actual,
        max,
      },
    });
  },
});
