import { Request, Response, NextFunction } from "express";
import { getBotName } from "@/presentation/middleware/auth/security/bot-detection";
import logger from "@/infrastructure/logging";

/**
 * Express-level bot blocker middleware.
 *
 * Rejects known crawler/bot user-agents with HTTP 403 before they reach
 * Apollo Server.  Blocking here (rather than inside the Apollo context
 * function) ensures the response status is a proper 4xx instead of the
 * 500 that Apollo Server emits when the context function throws without
 * an `extensions.http.status` value.
 */
export function botBlocker(req: Request, res: Response, next: NextFunction): void {
  const rawUA = req.headers["user-agent"];
  const userAgent = Array.isArray(rawUA) ? rawUA[0] : rawUA;

  const botName = getBotName(userAgent);
  if (botName) {
    logger.debug("🤖 Bot blocked at HTTP layer", { botName, url: req.originalUrl });
    res.status(403).json({ error: "Bot access blocked" });
    return;
  }

  next();
}
