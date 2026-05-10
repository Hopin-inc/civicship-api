/**
 * Admin REST endpoint: 週次 anchor バッチを起動する。
 *
 * - 認可: `X-CloudScheduler-Token` ヘッダの一致 (`CLOUD_SCHEDULER_TOKEN`)
 *   - 不一致 / 未設定 → 401
 * - リクエスト body: `{ weeklyKey?: string }`
 *   - 省略時はサーバ側で ISO 週キーを計算
 * - レスポンス: AnchorBatchPresenter.toHttpResponse の DTO
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §5.3.1 (週次バッチ)
 */

import express, { Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { container } from "tsyringe";
import logger from "@/infrastructure/logging";
import AnchorBatchUseCase from "@/application/domain/anchor/anchorBatch/usecase";
import { isValidWeeklyKey } from "@/application/domain/anchor/anchorBatch/service";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

const router = express.Router();

/**
 * Timing-safe な token 比較。
 *
 * - `provided` / `expected` の長さが異なる場合は `timingSafeEqual` が
 *   throw するため、長さ違いを先に false で短絡させる。
 * - `req.header()` は `string | string[] | undefined` を返すため、
 *   string narrowing も呼び出し側で行う前提。
 */
function safeTokenEqual(provided: string, expected: string): boolean {
  const providedBuf = Buffer.from(provided, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Cloud Scheduler から呼ばれる internal endpoint。
 *
 * Cloud Scheduler は HTTP target に固定 header (`X-CloudScheduler-Token`) を
 * 付けて呼び出す運用にし、その値を Secret Manager 経由で env に投入する。
 */
router.post("/run", express.json({ limit: "1mb" }), async (req: Request, res: Response) => {
  const expected = process.env.CLOUD_SCHEDULER_TOKEN;
  if (!expected) {
    logger.error("[anchorBatch] CLOUD_SCHEDULER_TOKEN is not configured; refusing request");
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
  const provided = req.header("X-CloudScheduler-Token");
  // `req.header()` は `string | string[] | undefined`。配列で渡された場合は
  // 認可失敗扱い（複数 token は仕様外）。
  if (typeof provided !== "string" || !safeTokenEqual(provided, expected)) {
    logger.warn("[anchorBatch] unauthorized request: token mismatch");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { weeklyKey: rawWeeklyKey } = req.body ?? {};
  if (rawWeeklyKey !== undefined && typeof rawWeeklyKey !== "string") {
    res.status(400).json({ error: "weeklyKey must be a string" });
    return;
  }
  if (typeof rawWeeklyKey === "string" && !isValidWeeklyKey(rawWeeklyKey)) {
    res.status(400).json({ error: "weeklyKey must match YYYY-Www" });
    return;
  }

  try {
    const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
    const ctx = { issuer } as IContext;
    const usecase = container.resolve(AnchorBatchUseCase);
    const result = await usecase.runBatch(ctx, {
      weeklyKey: rawWeeklyKey,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("[anchorBatch] runBatch failed", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
