import { ApolloServer } from "@apollo/server";
import logger from "@/infrastructure/logging";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import schema from "@/presentation/graphql/schema";
import { authZApolloPlugin } from "@graphql-authz/apollo-server-plugin";
import { rules } from "@/presentation/graphql/rule";
import { armorProtection } from "@/presentation/graphql/plugins/armor";

const isProduction = process.env.NODE_ENV === "production";

// パフォーマンス監視プラグイン
const performancePlugin = {
  requestDidStart: async (requestContext: any) => {
    const startTime = Date.now();
    const operationName = requestContext.request.operationName;
    const query = requestContext.request.query;

    logger.info("GraphQL request started", {
      operationName,
      query: query?.substring(0, 200) + (query?.length > 200 ? "..." : ""),
      timestamp: new Date().toISOString(),
    });

    return {
      willSendResponse: async (requestContext: any) => {
        const duration = Date.now() - startTime;
        const errors = requestContext.response.errors;

        logger.info("GraphQL request completed", {
          operationName,
          duration,
          hasErrors: !!errors,
          errorCount: errors?.length || 0,
          timestamp: new Date().toISOString(),
        });

        // 遅いリクエストの警告
        if (duration > 2000) {
          logger.warn("Slow GraphQL request detected", {
            operationName,
            duration,
            query: query?.substring(0, 500) + (query?.length > 500 ? "..." : ""),
            timestamp: new Date().toISOString(),
          });
        }
      },
      executionDidStart: async (executionContext: any) => {
        const resolverTimings: Array<{ fieldName: string; duration: number }> = [];

        return {
          willResolveField: (info: any) => {
            const startTime = Date.now();
            const fieldName = `${info.parentType.name}.${info.fieldName}`;

            return (result: any, error: any) => {
              const duration = Date.now() - startTime;
              resolverTimings.push({ fieldName, duration });

              // 遅いリゾルバーの警告
              if (duration > 1000) {
                logger.warn("Slow GraphQL resolver detected", {
                  fieldName,
                  duration,
                  operationName,
                  timestamp: new Date().toISOString(),
                });
              }

              if (error) {
                logger.error("GraphQL resolver error", {
                  fieldName,
                  error: error.message,
                  operationName,
                  timestamp: new Date().toISOString(),
                });
              }
            };
          },
          executionDidEnd: async (executionContext: any) => {
            const totalDuration = Date.now() - startTime;

            // 詳細なリゾルバー実行時間をログ
            if (resolverTimings.length > 0) {
              const slowResolvers = resolverTimings.filter(t => t.duration > 100);
              if (slowResolvers.length > 0) {
                logger.info("GraphQL resolver performance breakdown", {
                  operationName,
                  totalDuration,
                  slowResolvers: slowResolvers.map(r => ({
                    field: r.fieldName,
                    duration: r.duration
                  })),
                  timestamp: new Date().toISOString(),
                });
              }
            }
          },
        };
      },
    };
  },
};

export async function createApolloServer(httpServer: http.Server) {
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ...armorProtection.plugins,
      authZApolloPlugin({
        rules,
        processError: (error: unknown): never => {
          if (!isProduction) {
            throw error;
          }
          throw new Error("Internal Server Error");
        },
      }),
      performancePlugin, // パフォーマンス監視プラグインを追加
    ],
    validationRules: [...armorProtection.validationRules],
    formatError: (err) => {
      const { message, locations, path, extensions } = err;
      const code = extensions?.code ?? "INTERNAL_SERVER_ERROR";

      if (code === "INTERNAL_SERVER_ERROR") {
        logger.error(`GraphQL Error: ${message}`, err);
      }

      return {
        message,
        locations,
        path,
        extensions: {
          code,
        },
      };
    },

    introspection: !isProduction,
  });

  await server.start();
  return server;
}
