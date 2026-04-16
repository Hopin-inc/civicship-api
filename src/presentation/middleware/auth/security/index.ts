import http from "http";
import logger from "@/infrastructure/logging";
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
 * ② Admin access 判定
 * ③ communityId の存在チェック
 *
 * Bot UA ブロックは Express ミドルウェア（botBlocker）で行うため、ここでは不要。
 * → この関数を通過したら "認証処理に進んでも良い状態"
 */
export async function runRequestSecurityChecks(
  req: http.IncomingMessage,
  headers: AuthHeaders,
  issuer: PrismaClientIssuer
) {
  const url = req.url || "";
  const userAgent = Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : req.headers["user-agent"];

  // ① suspicious path (最優先)
  if (isSuspiciousPath(url)) {
    logger.warn("🚨 Suspicious path blocked", { url, userAgent });
    throw new AuthenticationError("Suspicious path blocked");
  }

  // ② Admin access check
  const adminResult = await handleAdminAccess(headers, issuer);
  if (adminResult) {
    logger.debug("🎯 Admin authenticated");
    return adminResult; // admin だけ即 context を返す
  }

  // ③ communityId が必要
  if (!headers.communityId) {
    const info = extractRequestInfo(req);
    logger.error("❌ Missing x-community-id header", info);
    throw new AuthenticationError("Missing x-community-id header");
  }

  // admin ではないが、Firebase Auth で処理すべきリクエスト
  return null;
}
