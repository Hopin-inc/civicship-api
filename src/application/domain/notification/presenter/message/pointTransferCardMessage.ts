import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";
import { formatNumber, getDayjsLocale } from "../../utils/language";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export type PointTransferKind = "grant" | "donation";

export interface PointTransferCardParams {
  kind: PointTransferKind;
  fromName: string;
  fromImageUrl: string;
  toName: string;
  toImageUrl: string;
  transferPoints: number;
  comment?: string;
  attachedImageUrl?: string;
  createdAt: Date;
  redirectUrl: string;
  language: Language;
}

export function buildPointTransferCardMessage(
  params: PointTransferCardParams,
): messagingApi.FlexMessage {
  const isJapanese = params.language === Language.JA;
  const formattedPoints = formatNumber(params.transferPoints, params.language);

  const altText = buildAltText(params, formattedPoints, isJapanese);

  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    ...(params.attachedImageUrl ? { header: buildHeader(params.attachedImageUrl) } : {}),
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl, params.language),
  };

  return {
    type: "flex",
    altText,
    contents: bubble,
  };
}

function buildAltText(
  params: PointTransferCardParams,
  formattedPoints: string,
  isJapanese: boolean,
): string {
  if (params.kind === "grant") {
    return isJapanese
      ? `${params.fromName}から${formattedPoints}ポイントが付与されました🎁`
      : `You received ${formattedPoints} points from ${params.fromName} 🎁`;
  }
  return isJapanese
    ? `${params.fromName}さんから${formattedPoints}ポイントが送られました🎁`
    : `You received ${formattedPoints} points from ${params.fromName} 🎁`;
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
        aspectRatio: "20:13",
        gravity: "center",
      },
    ],
  };
}

function buildBody(params: PointTransferCardParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    paddingTop: "lg",
    paddingBottom: "lg",
    spacing: "sm",
    contents: [
      buildTitle(params.kind, params.language),
      buildUserTransferRow(params),
      buildPointsSection(params),
      buildDateTimeLabel(params.createdAt, params.kind, params.language),
      ...(params.comment?.trim() ? [buildCommentSection(params.comment, params.language)] : []),
    ],
  };
}

function buildTitle(kind: PointTransferKind, language: Language): messagingApi.FlexText {
  const isJapanese = language === Language.JA;
  let text: string;
  if (kind === "grant") {
    text = isJapanese ? "ポイントの付与" : "Points Granted";
  } else {
    text = isJapanese ? "ポイントの受け取り" : "Points Received";
  }
  return {
    type: "text",
    text,
    size: "xs",
    color: "#1DB446",
    weight: "bold",
    align: "center",
  };
}

function buildUserTransferRow(params: PointTransferCardParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    alignItems: "center",
    justifyContent: "center",
    spacing: "md",
    margin: "lg",
    contents: [
      buildAvatarColumn(params.fromImageUrl, params.fromName),
      {
        type: "text",
        text: "→",
        size: "xl",
        color: "#999999",
        gravity: "center",
        align: "center",
        flex: 0,
      },
      buildAvatarColumn(params.toImageUrl, params.toName),
    ],
  };
}

function buildAvatarColumn(imageUrl: string, name: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    alignItems: "center",
    flex: 0,
    contents: [
      {
        type: "box",
        layout: "vertical",
        width: "64px",
        height: "64px",
        cornerRadius: "100px",
        borderColor: "#EEEEEE",
        borderWidth: "1px",
        contents: [
          {
            type: "image",
            url: imageUrl,
            size: "full",
            aspectMode: "cover",
          },
        ],
      },
      {
        type: "text",
        text: name,
        size: "xs",
        color: "#555555",
        align: "center",
        wrap: false,
      },
    ],
  };
}

function buildPointsSection(params: PointTransferCardParams): messagingApi.FlexBox {
  const formattedPoints = formatNumber(params.transferPoints, params.language);
  return {
    type: "box",
    layout: "baseline",
    justifyContent: "center",
    margin: "xl",
    contents: [
      {
        type: "text",
        text: formattedPoints,
        size: "xxl",
        weight: "bold",
        color: "#111111",
        flex: 0,
      },
      {
        type: "text",
        text: "pt",
        size: "md",
        color: "#555555",
        margin: "sm",
        flex: 0,
      },
    ],
  };
}

function buildDateTimeLabel(
  createdAt: Date,
  kind: PointTransferKind,
  language: Language,
): messagingApi.FlexText {
  const isJapanese = language === Language.JA;
  const locale = getDayjsLocale(language);
  const format = isJapanese ? "YYYY年M月D日 HH:mm" : "MMM D, YYYY HH:mm";
  const dateStr = dayjs(createdAt).tz("Asia/Tokyo").locale(locale).format(format);

  let reasonLabel: string;
  if (kind === "grant") {
    reasonLabel = isJapanese ? "付与" : "Granted";
  } else {
    reasonLabel = isJapanese ? "譲渡" : "Transferred";
  }

  return {
    type: "text",
    text: `${dateStr} · ${reasonLabel}`,
    size: "xs",
    color: "#999999",
    align: "center",
    margin: "md",
  };
}

function buildCommentSection(comment: string, language: Language): messagingApi.FlexBox {
  const isJapanese = language === Language.JA;
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
        text: comment,
        wrap: true,
        color: "#111111",
        size: "sm",
        margin: "xs",
      },
    ],
  };
}

function buildFooter(redirectUrl: string, language: Language): messagingApi.FlexBox {
  const buttonLabel = language === Language.JA ? "ウォレットを見る" : "View Wallet";

  return {
    type: "box",
    layout: "vertical",
    margin: "md",
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
