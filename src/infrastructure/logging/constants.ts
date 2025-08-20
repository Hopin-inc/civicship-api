export const ENTRY_HARD_LIMIT = 240 * 1024; // Cloud Logging 256KiB より余白
export const FIELD_SOFT_LIMIT = 32 * 1024;
export const STACK_LINE_LIMIT = 60;
export const STACK_CHAR_LIMIT = 16 * 1024;

export const EXCERPT_NORMAL = 2 * 1024;
export const EXCERPT_ON_ERROR = 16 * 1024;

export const LIKELY_HUGE_KEYS = [
  "payload", "body", "data", "rows", "items", "response", "request",
  "req", "res", "buffer", "blob", "html", "sql", "query",
];

// 絶対に残したいキー（最終段でも保持）
export const KEEP_ALWAYS = new Set([
  "level", "severity", "timestamp", "message", "__truncated", "http",
]);
