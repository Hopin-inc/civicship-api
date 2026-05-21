import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import { severity, errorReport } from "./formats/severity";
import { axiosNormalizer } from "./formats/axios";
import { sizeGuard } from "./formats/sizeGuard";
import { traceContext } from "./formats/traceContext";

// LOCAL_DEV is injected by `pnpm dev*` scripts so that running locally against
// a remote env (`dev:https:dev` / `dev:https:prd`) still uses console logging
// instead of shipping logs to Cloud Logging.
// NODE_ENV === "test" も含めることで、CI / jest 実行時に LoggingWinston が
// import 時点で GCP Project 自動検出を試みて失敗する事象を防ぐ (credential 不在)。
const isLocal =
  process.env.ENV === "LOCAL" ||
  process.env.LOCAL_DEV === "true" ||
  process.env.NODE_ENV === "test";
const isProduction = process.env.NODE_ENV === "production";
const isBatch = process.env.PROCESS_TYPE === "batch";

/**
 * Log level resolution, in priority order:
 *  1. `LOG_LEVEL` env — explicit override so ops can dial verbosity without
 *     a redeploy. Ignored when it is not a known winston npm level, so a
 *     typo cannot silently take down all logging.
 *  2. Batch jobs (`PROCESS_TYPE=batch`) — `info`, so their low-frequency
 *     lifecycle/summary lines stay visible in production instead of being
 *     dropped by the API's noise-suppressing `warn` threshold.
 *  3. Otherwise — `warn` in production (log volume / cost control),
 *     `debug` everywhere else.
 */
function resolveLogLevel(): string {
  const override = process.env.LOG_LEVEL?.toLowerCase();
  if (override && override in winston.config.npm.levels) {
    return override;
  }
  if (isBatch) return "info";
  return isProduction ? "warn" : "debug";
}

const baseFormats: winston.Logform.Format[] = [
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  severity(),
  errorReport(),
  axiosNormalizer(), // まず Axios を構造化
  sizeGuard(), // 次にサイズ制御
  traceContext(), // トレース情報を追加
];

if (!isLocal) {
  baseFormats.push(winston.format.json());
} else {
  baseFormats.push(
    winston.format.printf((info) => {
      const { timestamp, level, message, __truncated, ...rest } = info as {
        timestamp?: string;
        level?: string;
        message?: string;
        __truncated?: boolean;
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
  level: resolveLogLevel(),
  format: winston.format.combine(...baseFormats),
  transports,
});

export default logger;
