import { lineClient } from "@/infrastructure/libs/line";
import { logLineApiError, logLineApiSuccess } from "./logger";
import { HTTPFetchError, messagingApi } from "@line/bot-sdk";

export async function safeLinkRichMenuIdToUser(
  userId: string,
  richMenuId: string,
): Promise<boolean> {
  const endpoint = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;

  return retryIfFalse(async (retryCount) => {
    try {
      const response = await lineClient.linkRichMenuIdToUserWithHttpInfo(userId, richMenuId);
      logLineApiSuccess(
        "linkRichMenuIdToUser",
        endpoint,
        response.httpResponse,
        userId,
        retryCount,
      );
      return true;
    } catch (error) {
      logLineApiError("linkRichMenuIdToUser", endpoint, error, userId, retryCount);
      return false;
    }
  });
}

export async function safePushMessage(
  params: {
    to: string;
    messages: messagingApi.Message[];
  },
  maxRetries = 3,
): Promise<boolean> {
  const endpoint = "https://api.line.me/v2/bot/message/push";
  const retryKey = crypto.randomUUID();

  for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
    try {
      const response = await lineClient.pushMessageWithHttpInfo(params, retryKey);

      logLineApiSuccess("pushMessage", endpoint, response.httpResponse, params.to, retryCount);
      return true;
    } catch (error) {
      const isRetriable =
        error instanceof HTTPFetchError && (error.status >= 500 || error.status === 408); // Internal Error or Timeout

      logLineApiError("pushMessage", endpoint, error, params.to, retryCount);

      if (!isRetriable || retryCount === maxRetries) return false;

      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, retryCount))); // Exponential backoff
    }
  }

  return false;
}

export async function retryIfFalse<T>(
  fn: (retryCount: number) => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
    const result = await fn(retryCount);
    if (result) return result;

    if (retryCount < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, retryCount)));
    }
  }
  return false as T;
}
