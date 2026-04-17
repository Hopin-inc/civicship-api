import rateLimit from 'express-rate-limit';
import { Request } from 'express';

const RATE_LIMIT_CONFIG = {
  WALLET_OPERATIONS: {
    windowMs: 1000, // 1 second
    max: 1, // 1 request per second for wallet operations
  },
  GENERAL_API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes for general API operations
  },
  SESSION_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per 15 minutes per IP
  },
} as const;

export const walletRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WALLET_OPERATIONS.windowMs,
  max: RATE_LIMIT_CONFIG.WALLET_OPERATIONS.max,
  message: {
    error: 'Too many wallet address update requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

export function extractUidFromIdToken(idToken: string): string | null {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

export const sessionLoginRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.SESSION_LOGIN.windowMs,
  max: RATE_LIMIT_CONFIG.SESSION_LOGIN.max,
  message: {
    error: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const idToken = req.body?.idToken;
    if (typeof idToken === 'string') {
      const uid = extractUidFromIdToken(idToken);
      if (uid) return `${ip}:${uid}`;
    }
    return ip;
  },
});

export const apiRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.GENERAL_API.windowMs,
  max: RATE_LIMIT_CONFIG.GENERAL_API.max,
  message: {
    error: 'Too many API requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
