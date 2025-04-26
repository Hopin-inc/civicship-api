import express from "express";
import { lineClient, lineMiddleware } from "@/infrastructure/libs/line";
import { LIFFAuthUseCase, LIFFLoginRequest } from "@/application/domain/auth/liff/usercase";
import logger from "@/infrastructure/logging";

const router = express();

router.post("/callback", lineMiddleware, (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      logger.error(err);
      res.status(500).end();
    });
});

router.post("/liff-login", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "ID token is required" });
    }

    const loginRequest: LIFFLoginRequest = { accessToken };
    const result = await LIFFAuthUseCase.login(loginRequest);

    return res.status(200).json({
      customToken: result.customToken,
      profile: result.profile,
    });
  } catch (error) {
    logger.error("LIFF login error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
});

const handleEvent = (event) => {
  if (event.type !== "message" || event.message.type !== "text" || !event.replyToken) {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // use reply API
  return lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: "textV2",
        text: event.message.text,
      },
    ],
  });
};

export default router;
