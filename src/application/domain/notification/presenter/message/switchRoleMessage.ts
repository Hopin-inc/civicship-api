import { messagingApi } from "@line/bot-sdk";

export function buildAdminGrantedMessage(): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "xl",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "管理者権限が付与されました 🎉",
          size: "lg",
          weight: "bold",
          color: "#1DB446",
          wrap: true,
        },
        {
          type: "text",
          text: "これから管理画面での操作が可能になります。",
          size: "sm",
          color: "#555555",
          wrap: true,
        },
      ],
    },
  };

  return {
    type: "flex",
    altText: "管理者権限が付与されました",
    contents: bubble,
  };
}
