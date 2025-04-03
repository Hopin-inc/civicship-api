import { messagingApi } from "@line/bot-sdk";

export interface ReservationAcceptedParams {
  title: string;
  date: string;
  time: string;
  place: string;
  participantCount: string;
  price: string;
  hostName: string;
  hostImageUrl: string;
  eventImageUrl: string;
  redirectUrl: string;
}

export function buildReservationAcceptedMessage(
  params: ReservationAcceptedParams,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    header: buildHeader(params.eventImageUrl),
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl),
    styles: {
      footer: { separator: true },
    },
  };

  return {
    type: "flex",
    altText: `${params.title} の予約確定のお知らせ`,
    contents: bubble,
  };
}

function buildHeader(eventImageUrl: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "image",
        url: eventImageUrl,
        size: "full",
        aspectMode: "cover",
        aspectRatio: "20:13",
        gravity: "center",
      },
    ],
    paddingAll: "0px",
  };
}

function buildBody(params: ReservationAcceptedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "20px",
    paddingEnd: "20px",
    contents: [
      {
        type: "text",
        text: "予約確定のお知らせ",
        size: "xl",
        weight: "bold",
        wrap: true,
        color: "#111111",
      },
      {
        type: "text",
        text: "ご予約が確定しました。以下の詳細をご確認ください。",
        size: "sm",
        color: "#111111",
        wrap: true,
        margin: "md",
      },
      {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        margin: "lg",
        paddingAll: "13px",
        backgroundColor: "#FAFAFA",
        cornerRadius: "xs",
        contents: [
          createRow("日付", params.date),
          createRow("時間", params.time),
          createRow("場所", params.place),
          createRow("人数", params.participantCount),
          createRow("金額", params.price),
        ],
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
                text: "もしご都合が合わなければ、別日程でも楽しくご案内いたします！",
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

function createRow(label: string, value: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "md",
    alignItems: "center",
    contents: [
      { type: "text", text: label, size: "xs", color: "#555555", flex: 0 },
      { type: "text", text: value, size: "md", color: "#111111" },
    ],
  };
}

function buildFooter(redirectUrl: string): messagingApi.FlexBox {
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
          label: "詳細を確認する",
          uri: redirectUrl,
        },
      },
    ],
    paddingAll: "10px",
  };
}
