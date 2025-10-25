import { messagingApi } from "@line/bot-sdk";

export interface PointDonationReceivedParams {
  fromUserName: string;
  transferPoints: number;
  comment?: string;
  redirectUrl: string;
}

export function buildPointDonationReceivedMessage(
  params: PointDonationReceivedParams,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl),
  };

  return {
    type: "flex",
    altText: `${params.fromUserName}さんから${params.transferPoints}ポイントが送られました🎁`,
    contents: bubble,
  };
}

function buildBody(params: PointDonationReceivedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [
      buildTitle(),
      buildPointInfo(params),
      buildCommentSection(params.comment),
      buildExplainMessage(params),
    ].filter(Boolean) as messagingApi.FlexComponent[],
  };
}

function buildTitle(): messagingApi.FlexText {
  return {
    type: "text",
    text: "ポイントの受け取り",
    size: "xs",
    color: "#1DB446",
    weight: "bold",
  };
}

function buildPointInfo(params: PointDonationReceivedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    margin: "md",
    contents: [
      {
        type: "text",
        text: `${params.transferPoints}pt`,
        size: "xl",
        weight: "bold",
        wrap: true,
        color: "#333333",
      },
      {
        type: "text",
        text: `${params.fromUserName}さんから`,
        size: "sm",
        color: "#555555",
        margin: "sm",
      },
    ],
  };
}

function buildCommentSection(comment?: string): messagingApi.FlexBox | null {
  const safeComment = typeof comment === "string" ? comment.trim() : "";
  if (safeComment.length === 0) return null; // コメントなし → 非表示

  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    paddingTop: "md",
    paddingBottom: "md",
    contents: [
      {
        type: "text",
        text: safeComment,
        size: "sm",
        color: "#111111",
        wrap: true,
      },
    ],
  };
}

function buildExplainMessage(params: PointDonationReceivedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    paddingTop: "xl",
    paddingBottom: "xl",
    contents: [
      {
        type: "text",
        contents: [
          {
            type: "span",
            text: `${params.fromUserName}さんからポイントが送られました`,
            color: "#111111",
          },
        ],
        size: "sm",
        wrap: true,
      },
      {
        type: "text",
        text: "※「ウォレットを見る」ボタンから詳細を確認できます。",
        size: "xs",
        color: "#999999",
        wrap: true,
      },
    ],
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
          label: "ウォレットを見る",
          uri: redirectUrl,
        },
      },
    ],
  };
}
