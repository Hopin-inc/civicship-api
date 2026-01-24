import http from "http";
import logger from "@/infrastructure/logging";
import { isBot, getBotName } from "./bot-detection";
import { isSuspiciousPath } from "./suspicious-paths";
import { extractRequestInfo } from "./extract-request-info";
import { AuthenticationError } from "@/errors/graphql";
import { handleAdminAccess } from "./admin-access";
import { AuthHeaders } from "../types";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

/**
 * GraphQL Request Security Layer
 *
 * ① パス攻撃（WAF的）ブロック
 * ② Bot UA ブロック
 * ③ Admin access 判定
 * ④ communityId の存在チェック
 *
 * → この関数を通過したら "認証処理に進んでも良い状態"
 */
export async function runRequestSecurityChecks(
  req: http.IncomingMessage, 
  headers: AuthHeaders,
  issuer: PrismaClientIssuer,
  operationInfo?: { operationName: string; operationType: string }
) {
  const url = req.url || "";
  const userAgent = Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : req.headers["user-agent"];

  // ① suspicious path (最優先)
  if (isSuspiciousPath(url)) {
    logger.warn("🚨 Suspicious path blocked", { url, userAgent });
    throw new AuthenticationError("Suspicious path blocked");
  }

  // ② Bot detection
  if (isBot(userAgent)) {
    const botName = getBotName(userAgent);
    logger.debug("🤖 Bot blocked", { botName, url });
    throw new AuthenticationError("Bot access blocked");
  }

  // ③ Admin access check
  const adminResult = await handleAdminAccess(headers, issuer);
  if (adminResult) {
    logger.debug("🎯 Admin authenticated");
    return adminResult; // admin だけ即 context を返す
  }

  // ④ communityId が必要
  if (!headers.communityId) {
    const info = extractRequestInfo(req);
    logger.error("❌ Missing x-community-id header", {
      ...info,
      operationName: operationInfo?.operationName,
      operationType: operationInfo?.operationType,
    });
    throw new AuthenticationError("Missing x-community-id header");
  }

  // admin ではないが、Firebase Auth で処理すべきリクエスト
  return null;
}
