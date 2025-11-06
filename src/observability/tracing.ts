import { NodeSDK } from '@opentelemetry/sdk-node';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

const ENV = process.env.ENV || 'LOCAL';
const NODE_ENV = process.env.NODE_ENV;
const TRACE_SAMPLE_RATE = NODE_ENV === 'production' ? 0.01 : 1.0;
const SERVICE_VERSION = '1.0.0';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;

let sdk: NodeSDK | undefined;

if (NODE_ENV !== 'test') {
  if (ENV === 'LOCAL') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
  }

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'civicship-api',
    [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
    'service.environment': ENV,
    ...(GCP_PROJECT_ID && { 'gcp.project_id': GCP_PROJECT_ID }),
  });

  const sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(TRACE_SAMPLE_RATE),
  });

  const instrumentations = [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) => {
        const url = req.url || '';
        return url.includes('/health') || req.method === 'OPTIONS';
      },
    }),

    new ExpressInstrumentation(),

    new GraphQLInstrumentation({
      allowValues: false,
      depth: 0,
      ignoreTrivialResolveSpans: true,
    }),

    new UndiciInstrumentation(),

    new PrismaInstrumentation(),
  ];

  sdk = new NodeSDK({
    resource,
    traceExporter: new TraceExporter(),
    sampler,
    instrumentations,
  });

  sdk.start();
  console.log(`🔍 OpenTelemetry tracing initialized (sampling: ${TRACE_SAMPLE_RATE * 100}%)`);

  const handleShutdown = async () => {
    if (sdk) {
      try {
        await sdk.shutdown();
        console.log('🔍 OpenTelemetry tracing shut down successfully');
      } catch (error) {
        console.error('Error shutting down OpenTelemetry:', error);
      }
    }
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
} else {
  console.log('Tracing disabled in test environment');
}

export const shutdown = async () => {
  if (sdk) {
    try {
      await sdk.shutdown();
      console.log('🔍 OpenTelemetry tracing shut down successfully');
    } catch (error) {
      console.error('Error shutting down OpenTelemetry:', error);
    }
  }
};

export { sdk };
