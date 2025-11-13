import logger from "@/infrastructure/logging";
import { HTTPFetchError, LINE_REQUEST_ID_HTTP_HEADER_NAME } from "@line/bot-sdk";

function baseLogFields(endpoint: string, uid?: string, retryCount?: number) {
  return {
    endpoint,
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
  responseBody?: unknown,
) {
  logger.info(`LINE ${operationName} success`, {
    ...baseLogFields(endpoint, uid, retryCount),
    requestId: response.headers.get(LINE_REQUEST_ID_HTTP_HEADER_NAME) ?? "N/A",
    statusCode: response.status,
    ...(responseBody ? { responseBody: JSON.stringify(responseBody) } : {}),
  });
}

export function logLineApiError(
  operationName: string,
  endpoint: string,
  error: unknown,
  uid?: string,
  retryCount?: number,
  requestBody?: unknown,
) {
  if (error instanceof HTTPFetchError) {
    let parsedBody: Record<string, unknown> | string;
    try {
      parsedBody = JSON.parse(error.body); // ← ここで JSON を解析
    } catch {
      parsedBody = error.body; // パースできなければそのまま
    }

    const logData = {
      ...baseLogFields(endpoint, uid, retryCount),
      requestId: error.headers.get(LINE_REQUEST_ID_HTTP_HEADER_NAME) ?? "N/A",
      statusCode: error.status,
      message: typeof parsedBody === 'string' ? error.message : (parsedBody?.message as string) ?? error.message,
      responseDetails: typeof parsedBody === 'string' ? undefined : parsedBody?.details as Record<string, unknown>,
      rawResponseBody: error.body,
      requestBody: requestBody ? JSON.stringify(requestBody) : undefined,
    };

    if (operationName === "getProfile" && error.status === 404) {
      logger.warn(`LINE ${operationName} failed`, {
        ...logData,
        reason: "User not visible to this channel (not a friend/blocked or channel mismatch)",
      });
    } else {
      logger.error(`LINE ${operationName} failed`, logData);
    }
  } else {
    logger.error(`LINE ${operationName} failed`, {
      ...baseLogFields(endpoint, uid, retryCount),
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
