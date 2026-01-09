import express from "express";
import { LIFFAuthUseCase } from "@/application/domain/account/auth/liff/usercase";
import logger from "@/infrastructure/logging";
import { createLineClientAndMiddleware } from "@/infrastructure/libs/line";
import { messagingApi, WebhookEvent } from "@line/bot-sdk";
import { ReplyMessageResponse } from "@line/bot-sdk/dist/messaging-api/model/replyMessageResponse";
import rateLimit from "express-rate-limit";

const router = express();

const liffLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

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

router.post("/liff-login", liffLoginLimiter, async (req, res) => {
  try {
    const { accessToken } = req.body;
    const communityId = req.headers["x-community-id"] as string;

    if (!accessToken || !communityId) {
      return res.status(400).json({ error: "accessToken and communityId are required" });
    }

    const result = await LIFFAuthUseCase.login({ accessToken, communityId });

    res.setHeader("X-Token-Expires-At", result.expiryTimestamp.toString());

    (req as any).context = {
      uid: result.profile.userId,
      platform: "LINE",
      idToken: accessToken,
      refreshToken: accessToken,
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
    logger.debug("Skipped non-text or invalid event", { type: event.type });
    return null;
  }

  try {
    const userId = event.source?.userId ?? "unknown";
    const messageText = event.message.text;

    logger.debug("LINE message received", { userId, messageText });

    const res = await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: messageText,
        },
      ],
    });

    logger.debug("LINE replyMessage success", { userId, replyToken: event.replyToken });
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
