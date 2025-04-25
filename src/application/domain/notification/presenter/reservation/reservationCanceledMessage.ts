import { messagingApi } from "@line/bot-sdk";

export interface ReservationCanceledParams {
  title: string;
  year: string;
  date: string;
  time: string;
  participantCount: string;
  applicantName: string;
  redirectUrl: string;
}

export function buildReservationCanceledMessage(
  params: ReservationCanceledParams,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl),
  };

  return {
    type: "flex",
    altText: `${params.date}の「${params.title}」の申込がキャンセルされました😭`,
    contents: bubble,
  };
}

function buildBody(params: ReservationCanceledParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [buildTitle(), buildOpportunityInfo(params), buildExplainMessage(params)],
  };
}

function buildTitle(): messagingApi.FlexText {
  return {
    type: "text",
    text: "申込キャンセル",
    size: "xs",
    color: "#EF4444",
    weight: "bold",
  };
}

function buildOpportunityInfo(params: ReservationCanceledParams): messagingApi.FlexBox {
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
        text: `${params.applicantName}・${params.participantCount}`,
        size: "xs",
        color: "#999999",
      },
    ],
  };
}

function buildExplainMessage(params: ReservationCanceledParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    paddingTop: "xl",
    paddingBottom: "xl",
    contents: [
      {
        type: "text",
        text: `誠に残念ですが、${params.applicantName}さんの申込はキャンセルとなりました。`,
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
          label: "詳細を確認する",
          uri: redirectUrl,
        },
      },
    ],
  };
}
