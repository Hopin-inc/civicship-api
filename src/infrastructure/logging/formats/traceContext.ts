import winston from "winston";
import { trace, context } from "@opentelemetry/api";

export const traceContext = (): winston.Logform.Format => {
  return winston.format((info) => {
    const span = trace.getSpan(context.active());
    if (span) {
      const spanContext = span.spanContext();
      if (spanContext) {
        const traceId = spanContext.traceId;
        const spanId = spanContext.spanId;
        const traceSampled = spanContext.traceFlags === 1;

        const projectId = process.env.GCP_PROJECT_ID;
        if (projectId && traceId) {
          info["logging.googleapis.com/trace"] = `projects/${projectId}/traces/${traceId}`;
          info["logging.googleapis.com/spanId"] = spanId;
          info["logging.googleapis.com/trace_sampled"] = traceSampled;
        }
      }
    }
    return info;
  })();
};
