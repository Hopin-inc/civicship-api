import { FlexMessage, FlexBubble, FlexBox } from "@line/bot-sdk";

interface CancelOpportunitySlotParams {
  title: string;
  date: string;
  time: string;
  hostName: string;
  hostImageUrl: string;
  redirectUrl: string;
}

export default class CancelOpportunitySlotMessage {
  public static create(params: CancelOpportunitySlotParams): FlexMessage {
    const bubble: FlexBubble = {
      type: "bubble",
      header: buildHeader(),
      body: buildBody(params),
      footer: buildFooter(params.redirectUrl),
      styles: {
        footer: { separator: true },
      },
    };

    return {
      type: "flex",
      altText: `${params.title} の開催中止のお知らせ`,
      contents: bubble,
    };
  }
}

function buildHeader(): FlexBox {
  return {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "開催中止のお知らせ",
        color: "#111111",
        weight: "bold",
        size: "lg",
      },
    ],
  };
}

function buildBody(params: CancelOpportunitySlotParams): FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingAll: "20px",
    contents: [
      {
        type: "text",
        text: params.title,
        size: "md",
        color: "#111111",
        weight: "bold",
        wrap: true,
      },
      {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        margin: "xl",
        contents: [
          { type: "text", text: "日付", size: "xs", color: "#555555", flex: 0 },
          { type: "text", text: params.date, size: "md", color: "#111111" },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        contents: [
          { type: "text", text: "時間", size: "xs", color: "#555555", flex: 0 },
          { type: "text", text: params.time, size: "md", color: "#111111" },
        ],
      },
      {
        type: "text",
        text: "お申し込みいただいたイベントは、やむを得ず中止とさせていただきました。",
        size: "sm",
        color: "#111111",
        wrap: true,
        margin: "lg",
      },
      {
        type: "text",
        text: "楽しみにしてくださっていた皆様には、心よりお詫び申し上げます。",
        size: "sm",
        color: "#111111",
        wrap: true,
        margin: "sm",
      },
      {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        alignItems: "center",
        margin: "xxl",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "image",
                url: params.hostImageUrl,
                size: "full",
                aspectMode: "cover",
              },
            ],
            cornerRadius: "100px",
            width: "64px",
            height: "64px",
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
                text: "もしご都合が合いましたら、別日程でのご参加をご検討いただけると嬉しいです。",
                size: "xs",
                color: "#555555",
                wrap: true,
              },
            ],
          },
        ],
        paddingBottom: "28px",
      },
    ],
  };
}

function buildFooter(redirectUrl: string): FlexBox {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
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
