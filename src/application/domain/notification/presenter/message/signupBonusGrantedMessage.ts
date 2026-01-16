import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";
import { formatNumber } from "../../utils/language";

export interface SignupBonusGrantedParams {
  communityName: string;
  transferPoints: number;
  message?: string;
  walletUrl: string;
  language: Language;
}

/**
 * Builds plain text message for signup bonus notification.
 * Uses plain text instead of Flex Message so URLs become clickable links.
 */
export function buildSignupBonusGrantedMessage(
  params: SignupBonusGrantedParams,
): messagingApi.TextMessage {
  const isJapanese = params.language === Language.JA;
  const formattedPoints = formatNumber(params.transferPoints, params.language);

  const title = isJapanese ? "🎉 新規登録ボーナス" : "🎉 Sign-up Bonus";

  const mainMessage = isJapanese
    ? `${params.communityName}への登録ボーナスとして${formattedPoints}ptが付与されました！`
    : `You received ${formattedPoints} points as a sign-up bonus for ${params.communityName}!`;

  const walletLabel = isJapanese ? "ウォレットはこちら:" : "View your wallet:";

  // Build message parts
  const parts = [
    title,
    "",
    mainMessage,
  ];

  // Add custom message if provided
  if (params.message?.trim()) {
    parts.push("", params.message.trim());
  }

  // Add wallet link
  parts.push("", walletLabel, params.walletUrl);

  return {
    type: "text",
    text: parts.join("\n"),
  };
}
