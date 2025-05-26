import logger from "@/infrastructure/logging";
import { HTTPFetchError, LINE_REQUEST_ID_HTTP_HEADER_NAME } from "@line/bot-sdk";

function baseLogFields(endpoint: string, uid?: string, retryCount?: number) {
  return {
    endpoint,
    method: "POST",
    ...(uid ? { uid } : {}),
    ...(retryCount !== undefined ? { retryCount } : {}),
  };
}

export function logLineApiSuccess(
  operationName: string,
  endpoint: string,
  response: Response,
  uid?: string,
  retryCount?: number,
) {
  logger.info(`LINE ${operationName} success`, {
    ...baseLogFields(endpoint, uid, retryCount),
    requestId: response.headers.get(LINE_REQUEST_ID_HTTP_HEADER_NAME) ?? "N/A",
    statusCode: response.status,
  });
}

export function logLineApiError(
  operationName: string,
  endpoint: string,
  error: unknown,
  uid?: string,
  retryCount?: number,
  requestBody?: unknown,
  details?: unknown,
) {
  if (error instanceof HTTPFetchError) {
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(error.body); // ← ここで JSON を解析
    } catch {
      parsedBody = error.body; // パースできなければそのまま
    }

    logger.error(`LINE ${operationName} failed`, {
      ...baseLogFields(endpoint, uid, retryCount),
      requestId: error.headers.get(LINE_REQUEST_ID_HTTP_HEADER_NAME) ?? "N/A",
      statusCode: error.status,
      message: parsedBody?.message ?? error.message,
      responseDetails: parsedBody?.details,
      rawResponseBody: error.body,
      requestBody: requestBody ? JSON.stringify(requestBody) : undefined,
      details,
    });
  }
}
