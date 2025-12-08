import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";
import { formatNumber } from "../../utils/language";

export interface PointDonationReceivedParams {
  fromUserName: string;
  transferPoints: number;
  comment?: string;
  redirectUrl: string;
  language: Language;
}

export function buildPointDonationReceivedMessage(
  params: PointDonationReceivedParams,
): messagingApi.FlexMessage {
  const isJapanese = params.language === Language.JA;
  const formattedPoints = formatNumber(params.transferPoints, params.language);
  
  const altText = isJapanese
    ? `${params.fromUserName}さんから${formattedPoints}ポイントが送られました🎁`
    : `You received ${formattedPoints} points from ${params.fromUserName} 🎁`;

  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl, params.language),
  };

  return {
    type: "flex",
    altText,
    contents: bubble,
  };
}

function buildBody(params: PointDonationReceivedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [
      buildTitle(params.language),
      buildPointInfo(params),
      ...(params.comment?.trim() ? [buildCommentSection(params)] : []),
      buildExplainMessage(params.language),
    ],
  };
}

function buildTitle(language: Language): messagingApi.FlexText {
  return {
    type: "text",
    text: language === Language.JA ? "ポイントの受け取り" : "Points Received",
    size: "xs",
    color: "#1DB446",
    weight: "bold",
  };
}

function buildPointInfo(params: PointDonationReceivedParams): messagingApi.FlexBox {
  const isJapanese = params.language === Language.JA;
  const formattedPoints = formatNumber(params.transferPoints, params.language);
  const senderLabel = isJapanese 
    ? `送付者: ${params.fromUserName}さん`
    : `From: ${params.fromUserName}`;

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
        text: senderLabel,
        size: "sm",
        color: "#555555",
        margin: "sm",
      },
    ],
  };
}

function buildCommentSection(params: PointDonationReceivedParams): messagingApi.FlexBox {
  const isJapanese = params.language === Language.JA;
  const commentLabel = isJapanese ? "メッセージ" : "Message";

  return {
    type: "box",
    layout: "vertical",
    margin: "lg",
    spacing: "sm",
    backgroundColor: "#F7F7F7",
    cornerRadius: "md",
    paddingAll: "md",
    contents: [
      {
        type: "text",
        text: commentLabel,
        color: "#555555",
        size: "xs",
        weight: "bold",
      },
      {
        type: "text",
        text: params.comment!,
        wrap: true,
        color: "#111111",
        size: "sm",
        margin: "xs",
      },
    ],
  };
}

function buildExplainMessage(language: Language): messagingApi.FlexBox {
  const isJapanese = language === Language.JA;
  const mainText = isJapanese
    ? "ポイントが送られました"
    : "Points have been sent to you";
  const subText = isJapanese
    ? "※「ウォレットを見る」ボタンから残高を確認できます。"
    : "※You can check your balance using the \"View Wallet\" button.";

  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    paddingTop: "xl",
    paddingBottom: "xl",
    contents: [
      {
        type: "text",
        text: mainText,
        color: "#111111",
        size: "sm",
        wrap: true,
      },
      {
        type: "text",
        text: subText,
        size: "xs",
        color: "#999999",
        wrap: true,
      },
    ],
  };
}

function buildFooter(redirectUrl: string, language: Language): messagingApi.FlexBox {
  const buttonLabel = language === Language.JA ? "ウォレットを見る" : "View Wallet";

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
          label: buttonLabel,
          uri: redirectUrl,
        },
      },
    ],
  };
}
