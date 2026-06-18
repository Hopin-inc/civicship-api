import rateLimit from 'express-rate-limit';
import { Request } from 'express';

const RATE_LIMIT_CONFIG = {
  WALLET_OPERATIONS: {
    windowMs: 1000, // 1 second
    max: 1, // 1 request per second for wallet operations
  },
  NFT_SYNC_OPERATIONS: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 sync requests per minute per IP
  },
  NFT_READ_OPERATIONS: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 read requests per minute per IP
  },
  NFT_WEBHOOK_OPERATIONS: {
    windowMs: 60 * 1000, // 1 minute
    max: 120, // server-to-server webhook 用。業者サーバーの単一 IP に
    // 全リクエストが集約されるため、バースト (販売スパイク) を許容する
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

export const nftTokenSyncRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.NFT_SYNC_OPERATIONS.windowMs,
  max: RATE_LIMIT_CONFIG.NFT_SYNC_OPERATIONS.max,
  message: {
    error: 'Too many NFT token sync requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const nftReadRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.NFT_READ_OPERATIONS.windowMs,
  max: RATE_LIMIT_CONFIG.NFT_READ_OPERATIONS.max,
  message: {
    error: 'Too many NFT read requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// server-to-server webhook (POST /api/nft-wallets/by-ref) 用。
// 業者バックエンドの単一 IP に全リクエストが集約されるため、
// walletRateLimit (1 req/秒) ではなくバースト許容の分単位制限にする。
export const nftWebhookRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.NFT_WEBHOOK_OPERATIONS.windowMs,
  max: RATE_LIMIT_CONFIG.NFT_WEBHOOK_OPERATIONS.max,
  message: {
    error: 'Too many NFT webhook requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
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
