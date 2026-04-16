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

export interface RecentTransactionEntry {
  fromName: string;
  fromImageUrl: string;
  toName: string;
  toImageUrl: string;
  transferPoints: number;
  createdAt: Date;
  kind: PointTransferKind;
}

export function buildPointTransferCardMessage(
  params: PointTransferCardParams,
  recentTransactions?: RecentTransactionEntry[],
): messagingApi.FlexMessage {
  const isJapanese = params.language === Language.JA;
  const formattedPoints = formatNumber(params.transferPoints, params.language);

  const altText = buildAltText(params, formattedPoints, isJapanese);

  const mainBubble = buildMainBubble(params);

  const hasRecent = recentTransactions && recentTransactions.length > 0;

  if (!hasRecent) {
    return {
      type: "flex",
      altText,
      contents: mainBubble,
    };
  }

  const miniBubbles = recentTransactions.map((tx) =>
    buildMiniTransactionBubble(tx, params.language),
  );
  const viewMoreBubble = buildViewMoreBubble(params.redirectUrl, params.language);

  const carousel: messagingApi.FlexCarousel = {
    type: "carousel",
    contents: [mainBubble, ...miniBubbles, viewMoreBubble],
  };

  return {
    type: "flex",
    altText,
    contents: carousel,
  };
}

function buildMainBubble(params: PointTransferCardParams): messagingApi.FlexBubble {
  return {
    type: "bubble",
    ...(params.attachedImageUrl ? { header: buildHeader(params.attachedImageUrl) } : {}),
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl, params.language),
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

// --- Mini transaction bubble (for carousel) ---

function buildMiniTransactionBubble(
  tx: RecentTransactionEntry,
  language: Language,
): messagingApi.FlexBubble {
  return {
    type: "bubble",
    size: "micro",
    body: buildMiniBody(tx, language),
  };
}

function buildMiniBody(tx: RecentTransactionEntry, language: Language): messagingApi.FlexBox {
  const formattedPoints = formatNumber(tx.transferPoints, language);
  const isJapanese = language === Language.JA;
  const locale = getDayjsLocale(language);
  const dateStr = dayjs(tx.createdAt)
    .tz("Asia/Tokyo")
    .locale(locale)
    .format(isJapanese ? "M月D日" : "MMM D");
  const reasonLabel =
    tx.kind === "grant" ? (isJapanese ? "付与" : "Granted") : isJapanese ? "譲渡" : "Transfer";

  return {
    type: "box",
    layout: "vertical",
    paddingAll: "lg",
    spacing: "sm",
    alignItems: "center",
    justifyContent: "center",
    contents: [
      buildMiniAvatarRow(tx.fromImageUrl, tx.toImageUrl),
      buildMiniNamesRow(tx.fromName, tx.toName),
      {
        type: "box",
        layout: "baseline",
        justifyContent: "center",
        margin: "md",
        contents: [
          {
            type: "text",
            text: formattedPoints,
            size: "xl",
            weight: "bold",
            color: "#111111",
            flex: 0,
          },
          {
            type: "text",
            text: "pt",
            size: "sm",
            color: "#555555",
            margin: "xs",
            flex: 0,
          },
        ],
      },
      {
        type: "text",
        text: `${dateStr} · ${reasonLabel}`,
        size: "xxs",
        color: "#999999",
        align: "center",
        margin: "sm",
      },
    ],
  };
}

function buildMiniAvatarRow(fromImageUrl: string, toImageUrl: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    alignItems: "center",
    justifyContent: "center",
    spacing: "sm",
    contents: [
      buildMiniAvatar(fromImageUrl),
      {
        type: "text",
        text: "→",
        size: "sm",
        color: "#999999",
        flex: 0,
      },
      buildMiniAvatar(toImageUrl),
    ],
  };
}

function buildMiniAvatar(imageUrl: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    width: "40px",
    height: "40px",
    cornerRadius: "100px",
    borderColor: "#EEEEEE",
    borderWidth: "1px",
    flex: 0,
    contents: [
      {
        type: "image",
        url: imageUrl,
        size: "full",
        aspectMode: "cover",
      },
    ],
  };
}

function buildMiniNamesRow(fromName: string, toName: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    justifyContent: "center",
    spacing: "md",
    margin: "xs",
    contents: [
      {
        type: "text",
        text: fromName,
        size: "xxs",
        color: "#555555",
        align: "center",
        flex: 1,
        wrap: false,
      },
      {
        type: "text",
        text: toName,
        size: "xxs",
        color: "#555555",
        align: "center",
        flex: 1,
        wrap: false,
      },
    ],
  };
}

// --- "View more" bubble (last in carousel) ---

function buildViewMoreBubble(redirectUrl: string, language: Language): messagingApi.FlexBubble {
  const isJapanese = language === Language.JA;

  return {
    type: "bubble",
    size: "micro",
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "lg",
      justifyContent: "center",
      alignItems: "center",
      contents: [
        {
          type: "text",
          text: isJapanese ? "最近の活動" : "Recent Activity",
          size: "sm",
          color: "#555555",
          weight: "bold",
          align: "center",
        },
        {
          type: "button",
          style: "link",
          margin: "md",
          action: {
            type: "uri",
            label: isJapanese ? "もっと見る →" : "View More →",
            uri: redirectUrl,
          },
        },
      ],
    },
  };
}
