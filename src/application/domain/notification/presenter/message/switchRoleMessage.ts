import { messagingApi } from "@line/bot-sdk";

export function buildAdminGrantedMessage(redirectUrl: string): messagingApi.FlexMessage {
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
          text: "管理者権限の付与",
          size: "xs",
          weight: "bold",
          color: "#1DB446",
          wrap: true,
        },
        {
          type: "text",
          text: "管理者権限が付与されました。これから管理画面での操作が可能になります。",
          size: "sm",
          color: "#555555",
          wrap: true,
        },
      ],
    },
    footer: buildFooter(redirectUrl),
  };

  return {
    type: "flex",
    altText: "管理者権限が付与されました",
    contents: bubble,
  };
}

function buildFooter(redirectUrl: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    margin: "xxl",
    contents: [
      {
        type: "button",
        style: "link",
        action: {
          type: "uri",
          label: "詳細を確認する",
          uri: redirectUrl,
        },
      },
    ],
  };
}
