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
    altText: `${params.communityName}から${params.transferPoints}ポイントが付与されました🎁`,
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
    contents: [
      buildTitle(),
      buildPointInfo(params),
      buildDetailTable(params),
      buildExplainMessage(params),
    ],
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
  return {
    type: "box",
    layout: "vertical",
    margin: "md",
    contents: [
      {
        type: "text",
        text: `${params.transferPoints}ポイント`,
        size: "xxl",
        weight: "bold",
        wrap: true,
        color: "#333333",
      },
      {
        type: "text",
        text: `${params.communityName}から`,
        size: "sm",
        color: "#555555",
        margin: "sm",
      },
    ],
  };
}

function buildDetailTable(params: PointGrantReceivedParams): messagingApi.FlexBox {
  const contents: messagingApi.FlexComponent[] = [
    {
      type: "box",
      layout: "baseline",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: "付与元",
          color: "#555555",
          size: "sm",
          flex: 2,
        },
        {
          type: "text",
          text: params.communityName,
          wrap: true,
          color: "#111111",
          size: "sm",
          flex: 5,
        },
      ],
    },
    {
      type: "box",
      layout: "baseline",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: "ポイント",
          color: "#555555",
          size: "sm",
          flex: 2,
        },
        {
          type: "text",
          text: `${params.transferPoints}pt`,
          wrap: true,
          color: "#111111",
          size: "sm",
          flex: 5,
        },
      ],
    },
  ];

  if (params.comment) {
    contents.push({
      type: "box",
      layout: "baseline",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: "メッセージ",
          color: "#555555",
          size: "sm",
          flex: 2,
        },
        {
          type: "text",
          text: params.comment,
          wrap: true,
          color: "#111111",
          size: "sm",
          flex: 5,
        },
      ],
    });
  }

  return {
    type: "box",
    layout: "vertical",
    margin: "lg",
    spacing: "md",
    backgroundColor: "#F7F7F7",
    cornerRadius: "md",
    paddingAll: "xl",
    contents,
  };
}

function buildExplainMessage(params: PointGrantReceivedParams): messagingApi.FlexBox {
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
            text: `${params.communityName}からポイントが付与されました`,
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
