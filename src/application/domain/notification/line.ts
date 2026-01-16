import { logLineApiError, logLineApiSuccess } from "./logger";
import { LINE_REQUEST_ID_HTTP_HEADER_NAME, messagingApi } from "@line/bot-sdk";

export async function safeLinkRichMenuIdToUser(
  client: messagingApi.MessagingApiClient,
  userId: string,
  richMenuId: string,
): Promise<boolean> {
  const endpoint = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;

  const profile = await safeGetUserProfile(client, userId);
  if (!profile) {
    return false;
  }

  try {
    const response = await client.linkRichMenuIdToUserWithHttpInfo(userId, richMenuId);
    logLineApiSuccess("linkRichMenuIdToUser", endpoint, "POST", response.httpResponse, userId, undefined, {
      userId,
      richMenuId,
    });
    return true;
  } catch (error) {
    logLineApiError("linkRichMenuIdToUser", endpoint, "POST", error, userId, undefined, {
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

  const profile = await safeGetUserProfile(client, to);
  if (!profile) {
    return false;
  }

  try {
    await client.validatePushWithHttpInfo({ messages });
    const response = await client.pushMessageWithHttpInfo({ to, messages });
    logLineApiSuccess("pushMessage", endpoint, "POST", response.httpResponse, params.to, undefined, params);
    return true;
  } catch (error) {
    logLineApiError("pushMessage", endpoint, "POST", error, params.to, undefined, params);
    return false;
  }
}

async function safeGetUserProfile(
  client: messagingApi.MessagingApiClient,
  userId: string,
): Promise<messagingApi.UserProfileResponse | null> {
  const endpoint = `https://api.line.me/v2/bot/profile/${userId}`;
  try {
    const response = await client.getProfile(userId);
    logLineApiSuccess(
      "getProfile",
      endpoint,
      "GET",
      {
        status: 200,
        headers: new Headers({ [LINE_REQUEST_ID_HTTP_HEADER_NAME]: "N/A" }),
      } as Response,
      userId,
    );
    return response;
  } catch (error) {
    logLineApiError("getProfile", endpoint, "GET", error, userId);
    return null;
  }
}
