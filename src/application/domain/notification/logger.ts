import logger from "@/infrastructure/logging";
import { HTTPFetchError, LINE_REQUEST_ID_HTTP_HEADER_NAME } from "@line/bot-sdk";

export function logLineApiSuccess(
  operationName: string,
  endpoint: string,
  response: Response,
  uid?: string, // 👈 optional 引数として追加
) {
  logger.info(`LINE ${operationName} success`, {
    requestId: response.headers.get(LINE_REQUEST_ID_HTTP_HEADER_NAME) ?? "N/A",
    endpoint,
    method: "POST",
    statusCode: response.status,
    ...(uid ? { uid } : {}),
  });
}

export function logLineApiError(
  operationName: string,
  endpoint: string,
  error: unknown,
  uid?: string,
) {
  if (error instanceof HTTPFetchError) {
    logger.error(`LINE ${operationName} failed`, {
      requestId: error.headers.get(LINE_REQUEST_ID_HTTP_HEADER_NAME) ?? "N/A",
      endpoint,
      method: "POST",
      statusCode: error.status,
      ...(uid ? { uid } : {}),
    });
  } else if (error instanceof Error) {
    logger.error(`Unexpected error on LINE ${operationName}`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(uid ? { uid } : {}),
    });
  } else {
    logger.error(`Unknown error on LINE ${operationName}`, {
      error,
      ...(uid ? { uid } : {}),
    });
  }
}
