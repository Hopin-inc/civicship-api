import winston, { Logform } from "winston";
import type { ExtendedLogInfo } from "../types";

export const severity = winston.format((log: Logform.TransformableInfo) => {
  (log as ExtendedLogInfo).severity = log.level.toUpperCase();
  return log;
});

export const errorReport = winston.format((log: Logform.TransformableInfo) => {
  if (log instanceof Error) {
    (log as ExtendedLogInfo).err = {
      name: log.name,
      message: log.message,
      stack: log.stack,
    };
  }
  return log;
});
