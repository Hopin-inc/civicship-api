import { Request, Response, NextFunction } from "express";
import logger from "@/infrastructure/logging";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // リクエスト開始ログ
  logger.info(`[${requestId}] Request started`, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    referrer: req.headers.referer ?? null,
    timestamp: new Date().toISOString(),
  });

  // レスポンス終了時のログ
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    logger.info(`[${requestId}] Request completed`, {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString(),
    });

    // 遅いリクエストの警告
    if (duration > 3000) {
      logger.warn(`[${requestId}] Slow request detected`, {
        method: req.method,
        url: req.originalUrl,
        duration,
        statusCode,
        timestamp: new Date().toISOString(),
      });
    }

    // エラーレスポンスの詳細ログ
    if (statusCode >= 400) {
      logger.error(`[${requestId}] Request failed`, {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};
