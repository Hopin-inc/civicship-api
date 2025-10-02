import { Request, Response, NextFunction } from "express";
import logger from "@/infrastructure/logging";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`[Requested] ${req.method} ${req.originalUrl}`, {
    referrer: req.headers.referer ?? null,
    authorization: req.headers.authorization ?? null,
    contentType: req.headers["content-type"],
  });

  if (!req.is("multipart/form-data")) {
    logger.debug("[Requested][Body]", { body: req.body ?? null });
  }

  next();
};
