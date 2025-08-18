import winston, { Logform } from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";

const isLocal = process.env.ENV === "LOCAL";

// -------- 型定義 --------
export interface ExtendedLogInfo extends Logform.TransformableInfo {
  err?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  __truncated?: boolean;
  [key: string]: unknown; // 動的フィールドも許可
}

// -------- サイズ制御の設定値 --------
const ENTRY_HARD_LIMIT = 240 * 1024;
const FIELD_SOFT_LIMIT = 32 * 1024;
const STACK_LINE_LIMIT = 60;
const STACK_CHAR_LIMIT = 16 * 1024;

const LIKELY_HUGE_KEYS = [
  "payload", "body", "data", "rows", "items", "response", "request",
  "req", "res", "buffer", "blob", "html", "sql", "query",
];

// ---- ユーティリティ ----
const truncate = (s: string, limit: number, label = "…[truncated]") =>
  s.length > limit ? s.slice(0, limit) + label : s;

const summarizeObject = (obj: unknown, maxKeys = 30) => {
  if (!obj || typeof obj !== "object") return obj;
  try {
    const keys = Object.keys(obj);
    const head = keys.slice(0, maxKeys);
    const more = keys.length - head.length;
    return {
      __summary__: `Object trimmed (${keys.length} keys${more > 0 ? `, +${more} hidden` : ""})`,
      keys: head,
    };
  } catch {
    return { __summary__: "Unserializable object" };
  }
};

const limitStack = (stack?: string) => {
  if (!stack) return stack;
  const lines = stack.split("\n");
  const clippedByLines = lines.slice(0, STACK_LINE_LIMIT).join("\n");
  return truncate(clippedByLines, STACK_CHAR_LIMIT);
};

// -------- Winston Format --------
const sizeGuard = winston.format((info: Logform.TransformableInfo) => {
  const log = info as ExtendedLogInfo;

  // Error オブジェクト正規化
  if (info instanceof Error) {
    log.err = {
      name: info.name,
      message: truncate(info.message, FIELD_SOFT_LIMIT),
      stack: limitStack(info.stack),
    };
  } else if (log.err) {
    if (log.err.message) log.err.message = truncate(log.err.message, FIELD_SOFT_LIMIT);
    if (log.err.stack) log.err.stack = limitStack(log.err.stack);
  }

  // 巨大フィールドの抑制
  for (const key of LIKELY_HUGE_KEYS) {
    if (key in log) {
      const v = log[key];
      if (typeof v === "string") {
        log[key] = truncate(v, FIELD_SOFT_LIMIT);
      } else if (Buffer.isBuffer(v)) {
        log[key] = { __summary__: `Buffer ${(v as Buffer).length} bytes (trimmed)` };
      } else if (Array.isArray(v)) {
        log[key] = {
          __summary__: `Array trimmed (${(v as unknown[]).length} items)`,
          sample: (v as unknown[]).slice(0, 50),
        };
      } else if (typeof v === "object" && v !== null) {
        log[key] = summarizeObject(v);
      }
    }
  }

  // 文字列フィールドの長さ制限
  for (const [k, v] of Object.entries(log)) {
    if (typeof v === "string") {
      log[k] = truncate(v, FIELD_SOFT_LIMIT);
    }
  }

  // JSON サイズ見積もり & 削減
  const approxSize = () => {
    try {
      return Buffer.byteLength(JSON.stringify(log));
    } catch {
      return Number.MAX_SAFE_INTEGER;
    }
  };

  const pruneOrder = [
    ...LIKELY_HUGE_KEYS,
    "message", "stack", "err", "error", "details", "meta", "context",
  ];

  let size = approxSize();
  if (size > ENTRY_HARD_LIMIT) {
    log.__truncated = true;

    // message を短縮
    if (typeof log.message === "string") {
      log.message = truncate(log.message, 16 * 1024);
      size = approxSize();
    }

    // 順に削っていく
    for (const key of pruneOrder) {
      if (size <= ENTRY_HARD_LIMIT) break;
      if (!(key in log)) continue;

      const v = log[key];
      if (typeof v === "string") {
        log[key] = truncate(v, 4 * 1024);
      } else if (Array.isArray(v)) {
        log[key] = { __summary__: `Array omitted (${(v as unknown[]).length} items)` };
      } else if (typeof v === "object" && v !== null) {
        log[key] = summarizeObject(v, 10);
      } else {
        delete log[key];
      }
      size = approxSize();
    }

    if (size > ENTRY_HARD_LIMIT) {
      const keep = ["level", "severity", "timestamp", "message", "__truncated"];
      for (const k of Object.keys(log)) {
        if (!keep.includes(k)) delete log[k];
      }
    }
  }

  return log;
});

// -------- 他の Format --------
const severity = winston.format((log: Logform.TransformableInfo) => {
  (log as ExtendedLogInfo).severity = log.level.toUpperCase();
  return log;
});

const errorReport = winston.format((log: Logform.TransformableInfo) => {
  if (log instanceof Error) {
    (log as ExtendedLogInfo).err = {
      name: log.name,
      message: log.message,
      stack: log.stack,
    };
  }
  return log;
});

const baseFormats: Logform.Format[] = [
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  severity(),
  errorReport(),
  sizeGuard(),
];

if (!isLocal) {
  baseFormats.push(winston.format.json());
} else {
  baseFormats.push(
    winston.format.printf((info: Logform.TransformableInfo) => {
      const log = info as ExtendedLogInfo;
      const { timestamp, level, message, __truncated, ...rest } = log;
      const restStr =
        Object.keys(rest).length ? ` ${JSON.stringify(rest, null, 2)}` : "";
      return `${timestamp} ${level}: ${message}${__truncated ? " [TRUNCATED]" : ""}${restStr}`;
    })
  );
}

// -------- transports --------
const transports: winston.transport[] = [];
if (isLocal) {
  transports.push(new winston.transports.Console());
} else {
  transports.push(new LoggingWinston());
}

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(...baseFormats),
  transports,
});

export default logger;
