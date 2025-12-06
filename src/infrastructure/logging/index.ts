import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import { severity, errorReport } from "./formats/severity";
import { axiosNormalizer } from "./formats/axios";
import { sizeGuard } from "./formats/sizeGuard";
import { traceContext } from "./formats/traceContext";

const isLocal = process.env.ENV === "LOCAL";

const baseFormats: winston.Logform.Format[] = [
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  severity(),
  errorReport(),
  axiosNormalizer(), // まず Axios を構造化
  sizeGuard(),       // 次にサイズ制御
  traceContext(),    // トレース情報を追加
];

if (!isLocal) {
  baseFormats.push(winston.format.json());
} else {
  baseFormats.push(
    winston.format.printf((info) => {
      const { timestamp, level, message, __truncated, ...rest } = info as {
        timestamp?: string; level?: string; message?: string; __truncated?: boolean;
        [k: string]: unknown;
      };
      const restStr = Object.keys(rest).length ? ` ${JSON.stringify(rest, null, 2)}` : "";
      return `${timestamp ?? ""} ${level ?? ""}: ${message ?? ""}${
        __truncated ? " [TRUNCATED]" : ""
      }${restStr}`;
    }),
  );
}

const transports: winston.transport[] = [];
if (isLocal) {
  transports.push(new winston.transports.Console());
} else {
  transports.push(new LoggingWinston());
}

const logger = winston.createLogger({
  level: "debug", // 本番は "info" 推奨
  format: winston.format.combine(...baseFormats),
  transports,
});

export default logger;
