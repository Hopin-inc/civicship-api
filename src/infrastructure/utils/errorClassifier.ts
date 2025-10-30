import axios, { AxiosError } from "axios";

/**
 * リトライを永久に防止するためのretryCount値。
 * リトライ不要なエラー（404, 400系など）が発生した場合、この値を設定する。
 */
export const PERMANENTLY_FAILED_RETRY_COUNT = 999;

export enum ErrorCategory {
  NOT_FOUND = "NOT_FOUND", // 404: リトライ不要
  UNAUTHORIZED = "UNAUTHORIZED", // 401/403: トークン更新後リトライ
  CLIENT_ERROR = "CLIENT_ERROR", // 400系: リトライ不要
  SERVER_ERROR = "SERVER_ERROR", // 500系: リトライ可能
  NETWORK_ERROR = "NETWORK_ERROR", // タイムアウト等: リトライ可能
  RATE_LIMIT = "RATE_LIMIT", // 429: バックオフ後リトライ
  UNKNOWN = "UNKNOWN", // その他
}

export interface ClassifiedError {
  category: ErrorCategory;
  shouldRetry: boolean;
  maxRetries: number;
  httpStatus?: number;
  message: string;
  requestDetails?: {
    url?: string;
    method?: string;
    hasToken: boolean;
    requestData?: unknown;
    responseData?: unknown;
  };
}

export function classifyError(error: unknown, hasToken: boolean = false): ClassifiedError {
  if (!axios.isAxiosError(error)) {
    return {
      category: ErrorCategory.UNKNOWN,
      shouldRetry: true,
      maxRetries: 3,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  const config = axiosError.config;

  // リクエスト詳細（400系エラー用）
  const requestDetails = {
    url: config?.url,
    method: config?.method?.toUpperCase(),
    hasToken,
    requestData: config?.data,
    responseData: axiosError.response?.data,
  };

  if (!status) {
    // ネットワークエラー（タイムアウト、接続拒否等）
    return {
      category: ErrorCategory.NETWORK_ERROR,
      shouldRetry: true,
      maxRetries: 5,
      message: `Network error: ${axiosError.message}`,
    };
  }

  if (status === 404) {
    const detail = (axiosError.response?.data as { detail?: string })?.detail;
    return {
      category: ErrorCategory.NOT_FOUND,
      shouldRetry: false,
      maxRetries: 0,
      httpStatus: status,
      message: detail || "Resource not found on external API",
    };
  }

  if (status === 401 || status === 403) {
    return {
      category: ErrorCategory.UNAUTHORIZED,
      shouldRetry: true,
      maxRetries: 3, // トークン更新後最大3回
      httpStatus: status,
      message: `Authentication failed (HTTP ${status})`,
    };
  }

  if (status === 429) {
    return {
      category: ErrorCategory.RATE_LIMIT,
      shouldRetry: true,
      maxRetries: 3,
      httpStatus: status,
      message: "Rate limit exceeded (HTTP 429)",
    };
  }

  if (status >= 400 && status < 500) {
    // その他の400系エラー → リクエスト詳細を含める
    return {
      category: ErrorCategory.CLIENT_ERROR,
      shouldRetry: false,
      maxRetries: 0,
      httpStatus: status,
      message: `Client error (HTTP ${status})`,
      requestDetails,
    };
  }

  if (status >= 500) {
    return {
      category: ErrorCategory.SERVER_ERROR,
      shouldRetry: true,
      maxRetries: 5,
      httpStatus: status,
      message: `Server error (HTTP ${status})`,
      requestDetails,
    };
  }

  return {
    category: ErrorCategory.UNKNOWN,
    shouldRetry: true,
    maxRetries: 3,
    httpStatus: status,
    message: axiosError.message,
  };
}
