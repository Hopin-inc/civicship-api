import express from "express";
import { lineClient, lineMiddleware } from "@/infrastructure/libs/line";

const router = express();

router.post("/callback", lineMiddleware, (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const handleEvent = (event) => {
  if (event.type !== "message" || event.message.type !== "text" || !event.replyToken) {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // use reply API
  return lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [{
      type: "textV2",
      text: event.message.text,
    }],
  });
};

export default router;
