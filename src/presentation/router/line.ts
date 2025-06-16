import express from "express";
import axios from "axios";
import { LIFFAuthUseCase, LIFFLoginRequest } from "@/application/domain/account/auth/liff/usercase";
import logger from "@/infrastructure/logging";
import { createLineClientAndMiddleware } from "@/infrastructure/libs/line";
import { messagingApi, WebhookEvent } from "@line/bot-sdk";
import { ReplyMessageResponse } from "@line/bot-sdk/dist/messaging-api/model/replyMessageResponse";

const router = express();

router.post("/callback", async (req, res) => {
  try {
    const communityId = req.headers["x-community-id"] as string;
    if (!communityId) {
      res.status(400).json({ error: "Missing communityId" });
      return;
    }

    const { client, middleware } = await createLineClientAndMiddleware(communityId);

    middleware(req, res, async () => {
      try {
        const result = await Promise.all(
          req.body.events.map((event) => handleEvent(event, client)),
        );
        res.json(result);
      } catch (err) {
        logger.error("HandleEvent failed:", err);
        res.status(500).end();
      }
    });
  } catch (err) {
    logger.error("Callback middleware error:", err);
    res.status(500).end();
  }
});

router.post("/liff-login", async (req, res) => {
  try {
    const { accessToken, communityId } = req.body;
    if (!accessToken || !communityId) {
      return res.status(400).json({ error: "accessToken and communityId are required" });
    }

    const loginRequest: LIFFLoginRequest = { accessToken, communityId };
    const result = await LIFFAuthUseCase.login(loginRequest);

    const response = await axios.get(
      `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`,
    );
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + response.data.expires_in);
    const expiryTimestamp = Math.floor(expiryTime.getTime() / 1000);

    res.setHeader("X-Token-Expires-At", expiryTimestamp.toString());

    (req as any).context = {
      uid: result.profile.userId,
      platform: "LINE",
      idToken: accessToken,
      refreshToken: accessToken, // Using accessToken as refreshToken since actual refreshToken isn't available
    };

    return res.status(200).json({
      customToken: result.customToken,
      profile: result.profile,
    });
  } catch (error) {
    logger.error("LIFF login error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
});

const handleEvent = async (
  event: WebhookEvent,
  client: messagingApi.MessagingApiClient,
): Promise<ReplyMessageResponse | null> => {
  if (event.type !== "message" || event.message.type !== "text" || !event.replyToken) {
    logger.info("Skipped non-text or invalid event", { type: event.type });
    return null;
  }

  try {
    const userId = event.source?.userId ?? "unknown";
    const messageText = event.message.text;

    logger.info("LINE message received", { userId, messageText });

    const res = await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: messageText,
        },
      ],
    });

    logger.info("LINE replyMessage success", { userId, replyToken: event.replyToken });
    return res;
  } catch (err) {
    logger.error("LINE replyMessage failed", {
      error: err instanceof Error ? err.message : String(err),
      event,
    });
    return null;
  }
};

export default router;
