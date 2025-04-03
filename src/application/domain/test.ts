import { lineClient } from "@/infrastructure/libs/line";

const userId = "Uf4a68d8e6d68927a496120aa16842027";

await lineClient.pushMessage({
  to: userId,
  messages: [{ type: "text", text: "🎉 テストメッセージです！" }],
});

console.log("✅ メッセージ送信完了！");
