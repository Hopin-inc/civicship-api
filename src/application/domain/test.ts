import { lineClient } from "@/infrastructure/libs/line";
import CancelOpportunitySlotMessage from "@/consts/line/cancelOpportunitySlotMessage";

const userId = "Uf4a68d8e6d68927a496120aa16842027";

const messages = CancelOpportunitySlotMessage.flexMessage;

await lineClient.pushMessage({
  to: userId,
  messages: [messages],
});

console.log("✅ メッセージ送信完了！");
