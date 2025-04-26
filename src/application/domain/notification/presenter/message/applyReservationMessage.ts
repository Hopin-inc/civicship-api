import { messagingApi } from "@line/bot-sdk";

export interface ReservationAppliedParams {
  title: string;
  year: string;
  date: string;
  time: string;
  participantCount: string;
  applicantName: string;
  redirectUrl: string;
}

export function buildReservationAppliedMessage(
  params: ReservationAppliedParams,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl),
  };

  return {
    type: "flex",
    altText: `${params.date}開催「${params.title}」の参加申込が届きました🥰`,
    contents: bubble,
  };
}

function buildBody(params: ReservationAppliedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [
      buildTitle(),
      buildOpportunityInfo(params),
      buildReservationInfoTable(params),
      buildExplainMessage(),
    ],
  };
}

function buildTitle(): messagingApi.FlexText {
  return {
    type: "text",
    text: "新規の参加申込",
    size: "xs",
    color: "#1DB446",
    weight: "bold",
  };
}

function buildOpportunityInfo(params: ReservationAppliedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
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
    ],
  };
}

function buildReservationInfoTable(params: ReservationAppliedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    margin: "lg",
    spacing: "md",
    backgroundColor: "#F7F7F7",
    cornerRadius: "md",
    paddingAll: "xl",
    contents: [
      {
        type: "box",
        layout: "baseline",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: "申込枠",
            color: "#555555",
            size: "sm",
            flex: 2,
          },
          {
            type: "text",
            text: `${params.date} ${params.time}`,
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
            text: "申込者",
            color: "#555555",
            size: "sm",
            flex: 2,
          },
          {
            type: "text",
            text: params.applicantName,
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
            text: "人数",
            color: "#555555",
            size: "sm",
            flex: 2,
          },
          {
            type: "text",
            text: params.participantCount,
            wrap: true,
            color: "#111111",
            size: "sm",
            flex: 5,
          },
        ],
      },
    ],
  };
}

function buildExplainMessage(): messagingApi.FlexBox {
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
          { type: "span", text: "もしできるなら", color: "#111111" },
          { type: "span", text: "24時間以内", weight: "bold", color: "#111111" },
          { type: "span", text: "にお返事できる最高かもしれません😎", color: "#111111" },
        ],
        size: "sm",
        wrap: true,
      },
      {
        type: "text",
        text: `※すぐ下の「詳細を確認する」をタップして、申込を承認することができます。`,
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
          label: "詳細を確認する",
          uri: redirectUrl,
        },
      },
    ],
  };
}
