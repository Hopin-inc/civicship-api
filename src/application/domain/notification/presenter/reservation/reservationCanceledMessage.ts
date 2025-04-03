import { messagingApi } from "@line/bot-sdk";

export interface ReservationCanceledParams {
  title: string;
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
    header: buildCanceledHeader(),
    body: buildCanceledBody(params),
    footer: buildCanceledFooter(params.redirectUrl),
    styles: {
      footer: { separator: true },
    },
  };

  return {
    type: "flex",
    altText: `${params.title} の申し込みがキャンセルされました`,
    contents: bubble,
  };
}

function buildCanceledHeader(): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "申し込みがキャンセルされました",
        color: "#111111",
        size: "lg",
        weight: "bold",
      },
    ],
  };
}

function buildCanceledBody(params: ReservationCanceledParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingAll: "20px",
    backgroundColor: "#ffffff",
    contents: [
      {
        type: "text",
        text: "以下の体験予約がキャンセルされました。内容をご確認ください。",
        size: "sm",
        color: "#111111",
        wrap: true,
      },
      {
        type: "box",
        layout: "vertical",
        margin: "lg",
        paddingAll: "13px",
        backgroundColor: "#FAFAFA",
        cornerRadius: "xs",
        spacing: "md",
        contents: [
          createRow("体験名", params.title),
          createRow("日程", params.date),
          createRow("時間", params.time),
          createRow("人数", params.participantCount),
          createRow("申込者", params.applicantName),
        ],
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

function buildCanceledFooter(redirectUrl: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    contents: [
      {
        type: "button",
        style: "secondary",
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
