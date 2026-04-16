import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";
import { buildPointTransferCardMessage } from "./pointTransferCardMessage";

export interface PointGrantReceivedParams {
  communityName: string;
  communityImageUrl: string;
  toUserName: string;
  toUserImageUrl: string;
  transferPoints: number;
  comment?: string;
  attachedImageUrl?: string;
  createdAt: Date;
  redirectUrl: string;
  language: Language;
}

export function buildPointGrantReceivedMessage(
  params: PointGrantReceivedParams,
): messagingApi.FlexMessage {
  return buildPointTransferCardMessage({
    kind: "grant",
    fromName: params.communityName,
    fromImageUrl: params.communityImageUrl,
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
