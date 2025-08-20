import {
  STACK_CHAR_LIMIT, STACK_LINE_LIMIT,
  SENSITIVE_HEADER_KEYS,
  SENSITIVE_BODY_PATHS,
  HTTP_HEADER_MODE,
} from "./constants";

export const safeJson = (v: unknown): string | undefined => {
  try {
    return JSON.stringify(v);
  } catch {
    return undefined;
  }
};

export const truncateStr = (s: string, limit: number, label = "…[truncated]") =>
  s.length > limit ? s.slice(0, limit) + label : s;

export const limitStack = (stack?: string) => {
  if (!stack) return stack;
  const lines = stack.split("\n");
  const clipped = lines.slice(0, STACK_LINE_LIMIT).join("\n");
  return truncateStr(clipped, STACK_CHAR_LIMIT);
};

export const pickHeaders = (
  headers: Record<string, unknown> | undefined,
): Record<string, string | number | string[] | undefined> | undefined => {
  if (!headers) return undefined;
  const allow = [
    "content-type", "content-length", "x-request-id", "x-correlation-id",
    "x-trace-id", "traceparent", "x-amzn-trace-id", "date",
  ];
  const out: Record<string, string | number | string[] | undefined> = {};
  for (const k of allow) {
    const v = headers[k] ?? headers[k.toLowerCase() as keyof typeof headers];
    if (v !== undefined) out[k] = v as string | number | string[] | undefined;
  }
  return Object.keys(out).length ? out : undefined;
};

export const excerptBody = (body: unknown, limit: number): unknown => {
  if (body == null) return body;
  if (typeof body === "string") return truncateStr(body, limit);
  const json = safeJson(body);
  if (json) return truncateStr(json, limit);
  return { __summary__: "Unserializable body" };
};

/** AxiosHeaders/Headers 等を素朴な Record に正規化 */
export const normalizeHeaders = (
  headers: unknown,
): Record<string, unknown> | undefined => {
  if (!headers) return undefined;
  if (typeof headers === "object") {
    // axios v1 の AxiosHeaders 対応（toJSON があれば使う）
    const anyObj = headers as { toJSON?: () => Record<string, unknown> };
    const obj = typeof anyObj.toJSON === "function" ? anyObj.toJSON() : headers;
    return { ...(obj as Record<string, unknown>) };
  }
  return undefined;
};

/** ヘッダのマスク（機微キーを [REDACTED] に） */
export const redactHeaders = (
  headers: Record<string, unknown> | undefined,
): Record<string, string | number | string[] | undefined> | undefined => {
  if (!headers) return undefined;

  // allowlist or all
  const allow = [
    "content-type", "content-length", "x-request-id", "x-correlation-id",
    "x-trace-id", "traceparent", "x-amzn-trace-id", "date",
  ];
  const src: Record<string, unknown> =
    HTTP_HEADER_MODE === "all" ? headers : Object.fromEntries(
      allow.flatMap((k) => {
        const v = headers[k] ?? headers[k.toLowerCase() as keyof typeof headers];
        return v === undefined ? [] : [[k, v]];
      }),
    );

  const out: Record<string, string | number | string[] | undefined> = {};
  for (const [kRaw, v] of Object.entries(src)) {
    const k = kRaw.toLowerCase();
    if (SENSITIVE_HEADER_KEYS.includes(k)) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = v as string | number | string[] | undefined;
    }
  }
  return Object.keys(out).length ? out : undefined;
};

/** オブジェクトの深いキーをマスク（SENSITIVE_BODY_PATHS に一致） */
export const redactBody = (value: unknown): unknown => {
  const visit = (v: unknown, path: string[]): unknown => {
    if (v == null) return v;
    if (Array.isArray(v)) return v.map((x, i) => visit(x, [...path, String(i)]));
    if (typeof v === "object") {
      const o = v as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, inner] of Object.entries(o)) {
        const lowerK = k.toLowerCase();
        if (SENSITIVE_BODY_PATHS.some((p) => p.toLowerCase() === lowerK)) {
          out[k] = "[REDACTED]";
        } else {
          out[k] = visit(inner, [...path, k]);
        }
      }
      return out;
    }
    return v;
  };
  return visit(value, []);
};
