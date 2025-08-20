import type { Logform } from "winston";

export interface ExtendedLogInfo extends Logform.TransformableInfo {
  severity?: string;
  __truncated?: boolean;
  err?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  http?: {
    method?: string;
    url?: string;
    baseURL?: string;
    status?: number;
    statusText?: string;
    requestHeaders?: Record<string, string | number | string[] | undefined>;
    responseHeaders?: Record<string, string | number | string[] | undefined>;
    requestBodyExcerpt?: unknown;
    responseBodyExcerpt?: unknown;
    requestId?: string;
    traceId?: string;
    durationMs?: number;
  };
  [key: string]: unknown;
}
