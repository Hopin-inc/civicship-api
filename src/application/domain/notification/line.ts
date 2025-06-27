import { logLineApiError, logLineApiSuccess } from "./logger";
import { messagingApi } from "@line/bot-sdk";

export async function safeLinkRichMenuIdToUser(
  client: messagingApi.MessagingApiClient,
  userId: string,
  richMenuId: string,
): Promise<boolean> {
  const endpoint = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;

  try {
    const response = await client.linkRichMenuIdToUserWithHttpInfo(userId, richMenuId);
    logLineApiSuccess("linkRichMenuIdToUser", endpoint, response.httpResponse, userId, undefined, {
      userId,
      richMenuId,
    });
    return true;
  } catch (error) {
    logLineApiError("linkRichMenuIdToUser", endpoint, error, userId, undefined, {
      userId,
      richMenuId,
    });
    return false;
  }
}

export async function safePushMessage(
  client: messagingApi.MessagingApiClient,
  params: {
    to: string;
    messages: messagingApi.Message[];
  },
): Promise<boolean> {
  const endpoint = "https://api.line.me/v2/bot/message/push";
  const { to, messages } = params;

  try {
    await client.validatePushWithHttpInfo({ messages });
    const response = await client.pushMessageWithHttpInfo({ to, messages });
    logLineApiSuccess("pushMessage", endpoint, response.httpResponse, params.to, undefined, params);
    return true;
  } catch (error) {
    logLineApiError("pushMessage", endpoint, error, params.to, undefined, params);
    return false;
  }
}
