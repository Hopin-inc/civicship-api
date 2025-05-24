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
) {
  if (error instanceof HTTPFetchError) {
    logger.error(`LINE ${operationName} failed`, {
      ...baseLogFields(endpoint, uid, retryCount),
      requestId: error.headers.get(LINE_REQUEST_ID_HTTP_HEADER_NAME) ?? "N/A",
      statusCode: error.status,
    });
  } else if (error instanceof Error) {
    logger.error(`Unexpected error on LINE ${operationName}`, {
      ...baseLogFields(endpoint, uid, retryCount),
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    logger.error(`Unknown error on LINE ${operationName}`, {
      ...baseLogFields(endpoint, uid, retryCount),
      error,
    });
  }
}
