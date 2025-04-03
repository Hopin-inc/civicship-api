import { lineClient } from "@/infrastructure/libs/line";
import CancelOpportunitySlotMessage from "@/application/domain/opportunitySlot/line/cancelOpportunitySlotMessage";

const userId = "Uf4a68d8e6d68927a496120aa16842027";

const msg = CancelOpportunitySlotMessage.create({
  title: "オリーヴ兄弟から学ぶ　オリーブ収穫・テイスティング体験",
  date: "2025年7月25日 (土)",
  time: "13:00-15:00",
  hostName: "阪田 直樹",
  hostImageUrl: "https://developers-resource.landpress.line.me/fx/clip/clip13.jpg",
  redirectUrl: "https://your-reservation-url.com",
});

await lineClient.pushMessage({
  to: userId,
  messages: [msg],
});

console.log("✅ メッセージ送信完了！");
