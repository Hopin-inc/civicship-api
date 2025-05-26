import { messagingApi } from "@line/bot-sdk";

export interface ReservationAcceptedParams {
  title: string;
  thumbnail: string;
  year: string;
  date: string;
  time: string;
  place: string;
  participantCount: string;
  hostName: string;
  hostImageUrl: string;
  redirectUrl: string;
}

export function buildReservationAcceptedMessage(
  params: ReservationAcceptedParams,
): messagingApi.FlexMessage {
  return {
    type: "flex",
    altText: `${params.date}開催「${params.title}」の予約が確定しました🙋`,
    contents: buildBubble(params),
    // sender: {
    //   name: params.hostName,
    //   iconUrl: params.hostImageUrl,
    // },
  };
}

function buildBubble(params: ReservationAcceptedParams): messagingApi.FlexBubble {
  return {
    type: "bubble",
    header: buildHeader(params.thumbnail),
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl),
  };
}

function buildHeader(imageUrl: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    paddingAll: "0px",
    contents: [
      {
        type: "image",
        url: imageUrl,
        size: "full",
        aspectMode: "cover",
        aspectRatio: "20:10",
        gravity: "center",
      },
    ],
  };
}

function buildBody(params: ReservationAcceptedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [buildTitle(), buildOpportunityInfo(params), buildHostSection(params)],
  };
}

function buildTitle(): messagingApi.FlexText {
  return {
    type: "text",
    text: "予約確定",
    size: "xs",
    color: "#1DB446",
    weight: "bold",
  };
}

function buildOpportunityInfo(params: ReservationAcceptedParams): messagingApi.FlexBox {
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
      {
        type: "text",
        text: `${params.participantCount}・${params.place}`,
        size: "xs",
        color: "#999999",
      },
    ],
  };
}

function buildHostSection(params: ReservationAcceptedParams): messagingApi.FlexBox {
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
            text: "当日お会いできることを心待ちにしています☺️",
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
          label: "詳細を確認する",
          uri: redirectUrl,
        },
      },
    ],
  };
}
