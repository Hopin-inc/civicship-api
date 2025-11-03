import { AsyncLocalStorage } from "async_hooks";
import { PerfAggregator } from "./perf";

export interface RequestContext {
  correlationId: string;
  requestId: string;
  sampled: boolean;
  perfAggregator: PerfAggregator;
  instanceId: string;
  coldStart: boolean;
}

export const requestAls = new AsyncLocalStorage<RequestContext>();

export function getCorrelationId(): string | undefined {
  return requestAls.getStore()?.correlationId;
}

export function getRequestId(): string | undefined {
  return requestAls.getStore()?.requestId;
}

export function isSampled(): boolean {
  return requestAls.getStore()?.sampled ?? false;
}

export function getPerfAggregator(): PerfAggregator | undefined {
  return requestAls.getStore()?.perfAggregator;
}

export function getRequestContext(): RequestContext | undefined {
  return requestAls.getStore();
}
