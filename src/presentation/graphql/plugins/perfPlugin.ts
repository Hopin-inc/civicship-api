import { ApolloServerPlugin } from "@apollo/server";
import {
  getPerfAggregator,
  getCorrelationId,
  isSampled,
  getRequestContext,
} from "@/infrastructure/observability/als";
import logger from "@/infrastructure/logging";
import { buildServerTimingHeader } from "@/infrastructure/observability/serverTiming";

export function createPerfPlugin(): ApolloServerPlugin {
  return {
    async requestDidStart() {
      const aggregator = getPerfAggregator();
      const correlationId = getCorrelationId();
      const sampled = isSampled();
      const context = getRequestContext();

      if (!aggregator || !sampled) return;

      const requestStart = performance.now();
      let operationName: string | undefined;
      let operationType: string | undefined;

      return {
        async didResolveOperation(opContext) {
          operationName = opContext.operation?.name?.value;
          operationType = opContext.operation?.operation;
        },

        async parsingDidStart() {
          const start = performance.now();
          return async () => {
            aggregator.add("graphql.parse", performance.now() - start);
          };
        },

        async validationDidStart() {
          const start = performance.now();
          return async () => {
            aggregator.add("graphql.validate", performance.now() - start);
          };
        },

        async executionDidStart() {
          const execStart = performance.now();

          return {
            willResolveField({ info }) {
              if (
                info.parentType.name === "Query" ||
                info.parentType.name === "Mutation"
              ) {
                const fieldStart = performance.now();
                return () => {
                  const duration = performance.now() - fieldStart;
                  aggregator.add("resolver.root", duration, {
                    name: `${info.parentType.name}.${info.fieldName}`,
                    parentType: info.parentType.name,
                    fieldName: info.fieldName,
                  });
                };
              }
              return undefined;
            },

            async executionDidEnd() {
              aggregator.add("graphql.execute", performance.now() - execStart);
            },
          };
        },

        async willSendResponse({ response }) {
          const totalDuration = performance.now() - requestStart;
          aggregator.add("graphql.total", totalDuration);

          const summary = aggregator.summarize();

          const serverTiming = buildServerTimingHeader(summary);
          if (response.http) {
            response.http.headers.set("Server-Timing", serverTiming);
          }

          logger.info("⏱️ Performance: API Request", {
            event: "perf",
            correlationId,
            requestId: context?.requestId,
            service: "civicship-api",
            instanceId: context?.instanceId,
            coldStart: context?.coldStart,
            uptimeSec: process.uptime(),
            operationName,
            operationType,
            totalMs: Number(totalDuration.toFixed(2)),
            ...summary,
          });
        },
      };
    },
  };
}
