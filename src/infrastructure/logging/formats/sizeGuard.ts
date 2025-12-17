import winston, { Logform } from "winston";
import type { ExtendedLogInfo } from "../types";
import {
  ENTRY_HARD_LIMIT,
  FIELD_SOFT_LIMIT,
  KEEP_ALWAYS,
  LIKELY_HUGE_KEYS,
} from "../constants";
import { safeJson, truncateStr, limitStack } from "../utils";

/** 256KiB 制限に収めるためのサイズ制御フォーマット */
export const sizeGuard = winston.format((info: Logform.TransformableInfo) => {
  const log = info as ExtendedLogInfo;

  // Error 正規化
  if (info instanceof Error) {
    log.err = {
      name: info.name,
      message: truncateStr(info.message, FIELD_SOFT_LIMIT),
      stack: limitStack(info.stack),
    };
  } else if (log.err) {
    if (log.err.message) log.err.message = truncateStr(log.err.message, FIELD_SOFT_LIMIT);
    if (log.err.stack) log.err.stack = limitStack(log.err.stack);
  }

  // 巨大キーの抑制（http は扱わない：重要情報のため）
  for (const key of LIKELY_HUGE_KEYS) {
    if (key in log && key !== "http") {
      const v = log[key];
      if (typeof v === "string") {
        log[key] = truncateStr(v, FIELD_SOFT_LIMIT);
      } else if (Array.isArray(v)) {
        const len = v.length;
        log[key] = { __summary__: `Array trimmed (${len} items)` };
      } else if (v && typeof v === "object") {
        const keys = Object.keys(v as Record<string, unknown>);
        log[key] = { __summary__: `Object trimmed (${keys.length} keys)` };
      }
    }
  }

  // 一般文字列のソフト上限
  for (const [k, v] of Object.entries(log)) {
    if (typeof v === "string") {
      log[k] = truncateStr(v, FIELD_SOFT_LIMIT);
    }
  }

  // サイズ見積もり
  const approxSize = (): number => {
    const s = safeJson(log);
    return s ? Buffer.byteLength(s) : Number.MAX_SAFE_INTEGER;
  };

  // 削減の優先順（http は最後まで残す）
  const pruneOrder = [
    ...LIKELY_HUGE_KEYS.filter((k) => k !== "http"),
    "message",
    "stack",
    "err",
    "error",
    "details",
    "meta",
    "context",
  ];

  let size = approxSize();
  if (size > ENTRY_HARD_LIMIT) {
    log.__truncated = true;

    // message を先に短縮
    if (typeof log.message === "string") {
      log.message = truncateStr(log.message, 16 * 1024);
      size = approxSize();
    }

    // 優先順で削減（http は対象外）
    for (const key of pruneOrder) {
      if (size <= ENTRY_HARD_LIMIT) break;
      if (!(key in log)) continue;

      const v = log[key];
      if (typeof v === "string") {
        log[key] = truncateStr(v, 4 * 1024);
      } else if (Array.isArray(v)) {
        log[key] = { __summary__: "Array omitted" };
      } else if (v && typeof v === "object") {
        log[key] = { __summary__: "Object omitted" };
      } else {
        const rec = log as Record<string, unknown>;
        delete rec[key];
      }
      size = approxSize();
    }

    // まだ大きければ KEEP_ALWAYS 以外を削除
    if (size > ENTRY_HARD_LIMIT) {
      for (const k of Object.keys(log)) {
        if (!KEEP_ALWAYS.has(k)) {
          const rec = log as Record<string, unknown>;
          delete rec[k];
        }
      }
    }
  }

  return log;
});
