import * as line from "@line/bot-sdk";

const config: line.MiddlewareConfig = {
  channelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET!,
};

export const lineClient = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN!,
});

export const lineMiddleware = line.middleware(config);
