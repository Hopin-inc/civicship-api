import { Request, Response, NextFunction } from "express";
import logger from "@/infrastructure/logging";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`[Requested] ${req.method} ${req.originalUrl}`, {
    referrer: req.headers.referer ?? null,
    body: req.body ?? null,
    authorization: req.headers.authorization ?? null,
  });
  next();
};
