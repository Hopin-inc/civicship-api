import { Request, Response, NextFunction } from "express";
import logger from "@/infrastructure/logging";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`[Requested] ${req.method} ${req.originalUrl}`, {
    referrer: req.headers.referer ?? null,
    authorization: req.headers.authorization ?? null,
    contentType: req.headers["content-type"],
  });

  if (req.is("multipart/form-data")) {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString();
    });
    req.on("end", () => {
      logger.debug("[Requested][Raw Multipart]", { raw });
    });
  } else {
    logger.debug("[Requested][Body]", req.body ?? null);
  }

  next();
};
