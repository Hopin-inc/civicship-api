import { Request, Response, NextFunction } from "express";
import logger from "@/infrastructure/logging";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[Requested] ${req.method} ${req.originalUrl}`, {
    referrer: req.headers.referer ?? null,
    body: req.body ?? null,
    authorization: req.headers.authorization ?? null,
  });
  const { send } = res;
  res.send = function (body) {
    logger.debug(`[Responded] ${this.req.method} ${this.req.originalUrl}`, {
      request: {
        body: this.req.body,
      },
      response: {
        statusCode: this.statusCode,
        message: this.statusMessage,
        body,
      },
    });
    return send.call(this, body);
  }
  next();
};
