import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import { severity, errorReport } from "./formats/severity";
import { axiosNormalizer } from "./formats/axios";
import { sizeGuard } from "./formats/sizeGuard";

const isLocal = process.env.ENV === "LOCAL";
const logLevel = process.env.LOG_LEVEL || (isLocal ? "debug" : "info");
const enablePerformanceLogging = process.env.ENABLE_PERFORMANCE_LOGGING === "true";

const baseFormats: winston.Logform.Format[] = [
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  severity(),
  errorReport(),
  axiosNormalizer(), // まず Axios を構造化
  sizeGuard(),       // 次にサイズ制御
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
  level: logLevel,
  format: winston.format.combine(...baseFormats),
  transports,
});

// パフォーマンス監視が有効な場合の追加設定
if (enablePerformanceLogging) {
  logger.info("Performance logging enabled", {
    logLevel,
    timestamp: new Date().toISOString(),
  });
}

export default logger;
