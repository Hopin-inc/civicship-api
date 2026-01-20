import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";
import { formatNumber } from "../../utils/language";

export interface SignupBonusGrantedParams {
  communityName: string;
  transferPoints: number;
  comment?: string | null;
  language: Language;
}

export function buildSignupBonusGrantedMessage(
  params: SignupBonusGrantedParams,
): messagingApi.TextMessage {
  const isJapanese = params.language === Language.JA;

  // Use custom message (comment) if provided, otherwise use default message
  let text: string;
  if (params.comment?.trim()) {
    text = params.comment.trim();
  } else {
    const formattedPoints = formatNumber(params.transferPoints, params.language);
    text = isJapanese
      ? `${params.communityName}への参加おめでとうございます🎉 ${formattedPoints}ポイントを獲得しました！`
      : `Welcome to ${params.communityName} 🎉 You received ${formattedPoints} points!`;
  }

  return {
    type: "text",
    text,
  };
}
