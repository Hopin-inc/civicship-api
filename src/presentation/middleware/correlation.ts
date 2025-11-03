import { Request, Response, NextFunction } from "express";
import { requestAls, RequestContext } from "@/infrastructure/observability/als";
import { PerfAggregator } from "@/infrastructure/observability/perf";
import crypto from "crypto";

let hasServedFirstRequest = false;
const instanceId = crypto.randomUUID();

function parseCloudTraceContext(header: string | undefined): string | null {
  if (!header) return null;
  const match = header.match(/^([a-f0-9]{32})/);
  return match ? match[1] : null;
}

function hashCorrelationId(correlationId: string): number {
  let hash = 0;
  for (let i = 0; i < correlationId.length; i++) {
    hash = (hash << 5) - hash + correlationId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function correlationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const correlationId =
    req.header("X-Correlation-Id") ||
    parseCloudTraceContext(req.header("x-cloud-trace-context")) ||
    crypto.randomUUID();

  const requestId = crypto.randomUUID();

  const sampleRate = parseFloat(process.env.PERF_SAMPLE_RATE || "1.0");
  const sampled = hashCorrelationId(correlationId) / 0x7fffffff < sampleRate;

  const coldStart = !hasServedFirstRequest;
  if (!hasServedFirstRequest) {
    hasServedFirstRequest = true;
  }

  const context: RequestContext = {
    correlationId,
    requestId,
    sampled,
    perfAggregator: new PerfAggregator(),
    instanceId,
    coldStart,
  };

  requestAls.run(context, () => {
    res.locals.correlationId = correlationId;
    res.locals.requestId = requestId;
    next();
  });
}
