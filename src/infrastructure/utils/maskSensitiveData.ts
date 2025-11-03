/**
 * Mask sensitive data in objects for logging purposes
 * Masks tokens, passwords, and other PII
 */
export function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    if (data.length > 50 && /^[A-Za-z0-9_-]+$/.test(data)) {
      return `${data.substring(0, 10)}...${data.substring(data.length - 10)}`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (typeof data === "object") {
    const masked: Record<string, unknown> = {};
    const sensitiveKeys = [
      "authorization",
      "token",
      "password",
      "secret",
      "apikey",
      "api_key",
      "authtoken",
      "auth_token",
      "refreshtoken",
      "refresh_token",
      "idtoken",
      "id_token",
      "accesstoken",
      "access_token",
    ];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        if (typeof value === "string" && value.length > 8) {
          masked[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
        } else {
          masked[key] = "***MASKED***";
        }
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}
