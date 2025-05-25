import { messagingApi } from "@line/bot-sdk";

interface DeclineOpportunitySlotParams {
  title: string;
  year: string;
  date: string;
  time: string;
  hostName: string;
  hostImageUrl: string;
  comment?: string;
}

export function buildDeclineOpportunitySlotMessage(
  params: DeclineOpportunitySlotParams,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: buildBody(params),
  };

  return {
    type: "flex",
    altText: `${params.date}開催「${params.title}」への申込を辞退させていただきました🙇‍♀️`,
    contents: bubble,
    sender: {
      name: params.hostName,
      iconUrl: params.hostImageUrl,
    },
  };
}

function buildBody(params: DeclineOpportunitySlotParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [
      buildTitle(),
      buildOpportunityInfo(params),
      buildDeclineMessage(params.comment),
      buildHostSection(params),
    ],
  };
}

function buildTitle(): messagingApi.FlexText {
  return {
    type: "text",
    text: "申込辞退のご連絡",
    size: "xs",
    color: "#F59E0B", // Amber（注意のニュアンス）
    weight: "bold",
  };
}

function buildOpportunityInfo(params: DeclineOpportunitySlotParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    margin: "md",
    contents: [
      {
        type: "text",
        text: params.title,
        size: "lg",
        weight: "bold",
        wrap: true,
        color: "#333333",
      },
      {
        type: "text",
        text: `${params.year}${params.date} ${params.time}`,
        size: "sm",
        wrap: true,
        color: "#555555",
      },
    ],
  };
}

function buildDeclineMessage(comment?: string): messagingApi.FlexBox {
  const fallbackMessage =
    "今回は日程の都合により申込を辞退させていただきました。またの機会がございましたら、どうぞよろしくお願い致します。";

  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    paddingTop: "xl",
    paddingBottom: "xl",
    contents: [
      {
        type: "text",
        text: comment ?? fallbackMessage,
        size: "sm",
        color: "#111111",
        wrap: true,
      },
    ],
  };
}

function buildHostSection(params: DeclineOpportunitySlotParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "md",
    alignItems: "center",
    margin: "xxl",
    contents: [
      {
        type: "box",
        layout: "vertical",
        width: "64px",
        height: "64px",
        cornerRadius: "100px",
        contents: [
          {
            type: "image",
            url: params.hostImageUrl,
            size: "full",
            aspectMode: "cover",
          },
        ],
      },
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: params.hostName,
            size: "sm",
            color: "#111111",
            weight: "bold",
          },
          {
            type: "text",
            text: "ご理解のほど、どうぞよろしくお願いいたします🙇‍♀️",
            size: "xs",
            color: "#111111",
            wrap: true,
          },
        ],
      },
    ],
  };
}
