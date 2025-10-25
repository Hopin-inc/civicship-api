import { messagingApi } from "@line/bot-sdk";

export interface PointGrantReceivedParams {
  communityName: string;
  transferPoints: number;
  comment?: string;
  redirectUrl: string;
}

export function buildPointGrantReceivedMessage(
  params: PointGrantReceivedParams,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl),
  };

  return {
    type: "flex",
    altText: `${params.communityName}から${new Intl.NumberFormat("ja-JP").format(params.transferPoints)}ポイントが付与されました🎁`,
    contents: bubble,
  };
}

function buildBody(params: PointGrantReceivedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [buildTitle(), buildPointInfo(params), buildCommentSection(params.comment)].filter(
      Boolean,
    ) as messagingApi.FlexComponent[],
  };
}

function buildTitle(): messagingApi.FlexText {
  return {
    type: "text",
    text: "ポイントの付与",
    size: "xs",
    color: "#1DB446",
    weight: "bold",
  };
}

function buildPointInfo(params: PointGrantReceivedParams): messagingApi.FlexBox {
  const formattedPoints = new Intl.NumberFormat("ja-JP").format(params.transferPoints);

  return {
    type: "box",
    layout: "vertical",
    margin: "md",
    contents: [
      {
        type: "text",
        text: `${formattedPoints}pt`,
        size: "xxl",
        weight: "bold",
        wrap: true,
        color: "#333333",
      },
      {
        type: "text",
        text: `支給元: ${params.communityName}`,
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
    backgroundColor: "#F7F7F7",
    cornerRadius: "md",
    paddingAll: "md",
    margin: "md",
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
