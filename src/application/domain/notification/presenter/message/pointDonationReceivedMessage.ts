import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";
import { buildPointTransferCardMessage } from "./pointTransferCardMessage";

export interface PointDonationReceivedParams {
  fromUserName: string;
  fromUserImageUrl: string;
  toUserName: string;
  toUserImageUrl: string;
  transferPoints: number;
  comment?: string;
  attachedImageUrl?: string;
  createdAt: Date;
  redirectUrl: string;
  language: Language;
}

export function buildPointDonationReceivedMessage(
  params: PointDonationReceivedParams,
): messagingApi.FlexMessage {
  return buildPointTransferCardMessage({
    kind: "donation",
    fromName: params.fromUserName,
    fromImageUrl: params.fromUserImageUrl,
    toName: params.toUserName,
    toImageUrl: params.toUserImageUrl,
    transferPoints: params.transferPoints,
    comment: params.comment,
    attachedImageUrl: params.attachedImageUrl,
    createdAt: params.createdAt,
    redirectUrl: params.redirectUrl,
    language: params.language,
  });
}
