import http from "http";

export function extractRequestInfo(req: http.IncomingMessage) {
  const getHeader = (key: string) => req.headers[key.toLowerCase()];

  function normalize(value?: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
  }

  const forwardedFor = getHeader("x-forwarded-for");
  const realIp = getHeader("x-real-ip");

  let clientIp: string | undefined;
  if (forwardedFor) {
    const forwarded = normalize(forwardedFor);
    clientIp = forwarded?.split(",")[0].trim();
  } else if (realIp) {
    const real = normalize(realIp);
    clientIp = real?.split(",")[0].trim();
  } else {
    clientIp = req.socket.remoteAddress;
  }

  const userAgent = normalize(getHeader("user-agent"));
  const referer = normalize(getHeader("referer")) || normalize(getHeader("referrer")) || "none";
  const origin = normalize(getHeader("origin")) || "none";

  const excluded = new Set(["authorization", "cookie", "x-civicship-admin-api-key"]);
  const safeHeaders = Object.fromEntries(
    Object.entries(req.headers).filter(([key]) => !excluded.has(key.toLowerCase())),
  );

  return {
    clientIp: clientIp || "unknown",
    userAgent: userAgent || "unknown",
    referer,
    origin,
    method: req.method || "unknown",
    url: req.url || "unknown",
    headers: safeHeaders,
  };
}
