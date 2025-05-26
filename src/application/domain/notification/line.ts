import { lineClient } from "@/infrastructure/libs/line";
import { logLineApiError, logLineApiSuccess } from "./logger";
import { messagingApi } from "@line/bot-sdk";

export async function safeLinkRichMenuIdToUser(
  userId: string,
  richMenuId: string,
): Promise<boolean> {
  const endpoint = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;

  try {
    const response = await lineClient.linkRichMenuIdToUserWithHttpInfo(userId, richMenuId);
    logLineApiSuccess("linkRichMenuIdToUser", endpoint, response.httpResponse, userId);
    return true;
  } catch (error) {
    logLineApiError("linkRichMenuIdToUser", endpoint, error, userId);
    return false;
  }
}

export async function safePushMessage(params: {
  to: string;
  messages: messagingApi.Message[];
}): Promise<boolean> {
  const endpoint = "https://api.line.me/v2/bot/message/push";
  const { to, messages } = params;

  try {
    const response = await lineClient.pushMessageWithHttpInfo({ to, messages });
    logLineApiSuccess("pushMessage", endpoint, response.httpResponse, params.to);
    return true;
  } catch (error) {
    logLineApiError("pushMessage", endpoint, error, params.to);
    return false;
  }
}
