import { messagingApi } from "@line/bot-sdk";

interface CancelOpportunitySlotParams {
  title: string;
  year: string;
  date: string;
  time: string;
  hostName: string;
  hostImageUrl: string;
  redirectUrl: string;
}

export function buildCancelOpportunitySlotMessage(
  params: CancelOpportunitySlotParams,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl),
  };

  return {
    type: "flex",
    altText: `${params.date}開催「${params.title}」の開催を中止させていただきます🙇‍♀️`,
    contents: bubble,
    sender: {
      name: params.hostName,
      iconUrl: params.hostImageUrl,
    },
  };
}

function buildBody(params: CancelOpportunitySlotParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [
      buildTitle(),
      buildOpportunityInfo(params),
      buildApologyMessage(),
      buildHostSection(params),
    ],
  };
}

function buildTitle(): messagingApi.FlexText {
  return {
    type: "text",
    text: "開催中止のお知らせ",
    size: "xs",
    color: "#EF4444",
    weight: "bold",
  };
}

function buildOpportunityInfo(params: CancelOpportunitySlotParams): messagingApi.FlexBox {
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

function buildApologyMessage(): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    paddingTop: "xl",
    paddingBottom: "xl",
    contents: [
      {
        type: "text",
        text: "お申し込みいただいたイベントは、やむを得ず中止とさせていただきました。",
        size: "sm",
        color: "#111111",
        wrap: true,
      },
      {
        type: "text",
        text: "楽しみにしてくださっていた皆様には、心よりお詫び申し上げます。",
        size: "sm",
        color: "#111111",
        wrap: true,
      },
    ],
  };
}

function buildHostSection(params: CancelOpportunitySlotParams): messagingApi.FlexBox {
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
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: params.hostName,
                size: "sm",
                color: "#111111",
                weight: "bold",
              },
            ],
          },
          {
            type: "text",
            text: "もしご都合が合いましたら、別日程でのご参加をご検討いただけると嬉しいです🙇‍♀️",
            size: "xs",
            color: "#111111",
            wrap: true,
          },
        ],
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
          label: "別日程を確認する",
          uri: redirectUrl,
        },
      },
    ],
  };
}
