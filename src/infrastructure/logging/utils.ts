import { STACK_CHAR_LIMIT, STACK_LINE_LIMIT } from "./constants";

export const safeJson = (v: unknown): string | undefined => {
  try { return JSON.stringify(v); } catch { return undefined; }
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
