import { NodeSDK } from "@opentelemetry/sdk-node";
import { TraceExporter } from "@google-cloud/opentelemetry-cloud-trace-exporter";
import { CloudPropagator } from "@google-cloud/opentelemetry-cloud-trace-propagator";
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from "@opentelemetry/core";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation, ExpressLayerType } from "@opentelemetry/instrumentation-express";
import { GraphQLInstrumentation } from "@opentelemetry/instrumentation-graphql";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { ParentBasedSampler, TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import logger from "./index";

const ENV = process.env.ENV || "LOCAL";
const NODE_ENV = process.env.NODE_ENV;
const TRACE_SAMPLE_RATE = NODE_ENV === "production" ? 0.01 : 1.0;
const SERVICE_VERSION = "1.0.0";
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;

let sdk: NodeSDK | undefined;

export const tracingReady = (async () => {
  // ✅ 1. ローカルなら完全スキップ
  if (ENV === "LOCAL" || NODE_ENV === "test") {
    logger.info("🟡 OpenTelemetry disabled in local/test environment");
    return;
  }

  // ✅ 2. 非ローカルのみ初期化
  if (ENV !== "LOCAL") {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "civicship-api",
    [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
    "service.environment": ENV,
    ...(GCP_PROJECT_ID && { "gcp.project_id": GCP_PROJECT_ID }),
  });

  const sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(TRACE_SAMPLE_RATE),
  });

  const instrumentations = [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) => {
        const url = req.url || "";
        return url.includes("/health") || req.method === "OPTIONS";
      },
      requestHook: (span, request) => {
        const communityId = (request as any).headers?.["x-community-id"];
        if (communityId) {
          span.setAttribute("app.community_id", communityId);
        }
      },
    }),
    new ExpressInstrumentation({
      ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.ROUTER],
    }),
    new GraphQLInstrumentation({
      allowValues: false,
      depth: 1,
      ignoreTrivialResolveSpans: true,
    }),
    new UndiciInstrumentation(),
    new PrismaInstrumentation(),
  ];

  sdk = new NodeSDK({
    resource,
    traceExporter: new TraceExporter(),
    sampler,
    contextManager: new AsyncLocalStorageContextManager(),
    instrumentations,
    textMapPropagator: new CompositePropagator({
      propagators: [
        new CloudPropagator(),
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
      ],
    }),
  });

  await sdk.start();
  logger.info(`✅ OpenTelemetry tracing initialized (sampling: ${TRACE_SAMPLE_RATE * 100}%)`);

  const handleShutdown = async () => {
    if (sdk) {
      try {
        await sdk.shutdown();
        logger.info("🔍 OpenTelemetry tracing shut down successfully");
      } catch (error) {
        logger.error("Error shutting down OpenTelemetry:", error);
      }
    }
  };

  process.on("SIGTERM", handleShutdown);
  process.on("SIGINT", handleShutdown);
})();

export const shutdown = async () => {
  if (sdk) {
    try {
      await sdk.shutdown();
      logger.info("🔍 OpenTelemetry tracing shut down successfully");
    } catch (error) {
      logger.error("Error shutting down OpenTelemetry:", error);
    }
  }
};

export { sdk };
