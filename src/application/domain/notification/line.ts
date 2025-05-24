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
    logLineApiSuccess("linkRichMenuIdToUser", endpoint, response.httpResponse);
    return true;
  } catch (error) {
    logLineApiError("linkRichMenuIdToUser", endpoint, error);
    return false;
  }
}

export async function safePushMessage(params: { to: string; messages: messagingApi.Message[] }) {
  const endpoint = "https://api.line.me/v2/bot/message/push";

  try {
    const response = await lineClient.pushMessageWithHttpInfo(params);
    logLineApiSuccess("pushMessage", endpoint, response.httpResponse);
  } catch (error) {
    logLineApiError("pushMessage", endpoint, error);
  }
}
