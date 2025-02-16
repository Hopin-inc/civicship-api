import { Request, Response, NextFunction } from "express";
import logger from "@/infrastructure/logging";

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    referrer: req.headers.referer ?? null,
    body: req.body ?? null,
    authorization: req.headers.authorization ?? null,
  });
  next();
};
