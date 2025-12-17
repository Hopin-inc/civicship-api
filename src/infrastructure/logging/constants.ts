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

export const KEEP_ALWAYS = new Set([
  "level", "severity", "timestamp", "message", "__truncated", "http",
]);

export const SENSITIVE_HEADER_KEYS = [
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-access-token",
  "x-auth-token",
  "x-amzn-authorization",
];

export const SENSITIVE_BODY_PATHS = [
  "password",
  "pass",
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
  "clientSecret",
  "secret",
];

// ヘッダ出力モード（デフォルト: allowlist）
export const HTTP_HEADER_MODE: "allowlist" | "all" =
  (process.env.LOG_HTTP_HEADERS === "all" ? "all" : "allowlist");
