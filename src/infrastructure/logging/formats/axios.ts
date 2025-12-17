import winston, { Logform } from "winston";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ExtendedLogInfo } from "../types";
import { EXCERPT_NORMAL, EXCERPT_ON_ERROR } from "../constants";
import {
  normalizeHeaders, redactHeaders, excerptBody, truncateStr, limitStack, redactBody,
} from "../utils";

/**
 * Axios のリクエスト/レスポンス/エラーを http.* に正規化して集約します。
 * - エラー時は responseBodyExcerpt を広め（16KiB）に
 * - 元の巨大な raw response/request/config は除去
 */
export const axiosNormalizer = winston.format((info: Logform.TransformableInfo) => {
  const log = info as ExtendedLogInfo;

  const maybeAxiosError = log as unknown as Partial<AxiosError>;
  const isAxiosError = Boolean((maybeAxiosError as AxiosError).isAxiosError);
  const maybeAxiosResponse = (log.response as AxiosResponse | undefined);

  if (isAxiosError) {
    const err = maybeAxiosError as AxiosError;
    const cfg: AxiosRequestConfig | undefined = err.config;
    const res: AxiosResponse | undefined = err.response;
    const isHttpError = Boolean(res && typeof res.status === "number");
    const bodyLimit = isHttpError ? EXCERPT_ON_ERROR : EXCERPT_NORMAL;

    if (typeof log.message === "string") {
      log.message = truncateStr(log.message, 32 * 1024);
    }

    // ★ ヘッダ正規化 + マスク
    const reqHeaders = redactHeaders(normalizeHeaders(cfg?.headers));
    const resHeaders = redactHeaders(normalizeHeaders(res?.headers));

    // ★ ボディもマスク後に抜粋
    const redactedReqBody = redactBody(cfg?.data);
    const redactedResBody = redactBody(res?.data);

    log.http = {
      method: cfg?.method?.toUpperCase(),
      url: cfg?.url,
      baseURL: cfg?.baseURL,
      status: res?.status,
      statusText: res?.statusText,
      requestHeaders: reqHeaders,
      responseHeaders: resHeaders,
      requestBodyExcerpt: excerptBody(redactedReqBody, EXCERPT_NORMAL),
      responseBodyExcerpt: excerptBody(redactedResBody, bodyLimit),
      requestId:
        (res?.headers?.["x-request-id"] as string | undefined) ??
        (res?.headers?.["x-correlation-id"] as string | undefined),
      traceId:
        (res?.headers?.["x-trace-id"] as string | undefined) ??
        (res?.headers?.["traceparent"] as string | undefined),
    };

    log.err = {
      name: err.name,
      message: truncateStr(err.message ?? "", 32 * 1024),
      stack: limitStack(err.stack),
    };

    const rec = log as Record<string, unknown>;
    delete rec.response;
    delete rec.request;
    delete rec.config;
  } else if (maybeAxiosResponse && typeof maybeAxiosResponse === "object") {
    const res = maybeAxiosResponse as AxiosResponse;
    const cfg = res.config as AxiosRequestConfig | undefined;

    const reqHeaders = redactHeaders(normalizeHeaders(cfg?.headers));
    const resHeaders = redactHeaders(normalizeHeaders(res.headers));

    const redactedReqBody = redactBody(cfg?.data);
    const redactedResBody = redactBody(res.data);

    log.http = {
      method: cfg?.method?.toUpperCase(),
      url: cfg?.url,
      baseURL: cfg?.baseURL,
      status: res.status,
      statusText: res.statusText,
      requestHeaders: reqHeaders,
      responseHeaders: resHeaders,
      requestBodyExcerpt: excerptBody(redactedReqBody, EXCERPT_NORMAL),
      responseBodyExcerpt: excerptBody(redactedResBody, EXCERPT_NORMAL),
      requestId:
        (res.headers?.["x-request-id"] as string | undefined) ??
        (res.headers?.["x-correlation-id"] as string | undefined),
      traceId:
        (res.headers?.["x-trace-id"] as string | undefined) ??
        (res.headers?.["traceparent"] as string | undefined),
    };

    const rec = log as Record<string, unknown>;
    delete rec.response;
    delete rec.request;
    delete rec.config;
  }

  return log;
});
