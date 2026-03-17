import rateLimit from 'express-rate-limit';
import { timingSafeEqual } from 'crypto';
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
    max: 30, // 30 login attempts per 15 minutes per IP+community
  },
} as const;

export const skipRateLimitForAdminApiKey = (req: Request): boolean => {
  const apiKeyHeader = req.headers['x-api-key'];
  const adminApiKey = process.env.CIVICSHIP_ADMIN_API_KEY;

  if (Array.isArray(apiKeyHeader) || !apiKeyHeader || !adminApiKey) {
    return false;
  }

  const apiKeyBuffer = Buffer.from(apiKeyHeader);
  const adminApiKeyBuffer = Buffer.from(adminApiKey);

  if (apiKeyBuffer.length !== adminApiKeyBuffer.length) {
    return false;
  }

  return timingSafeEqual(apiKeyBuffer, adminApiKeyBuffer);
};

export const walletRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WALLET_OPERATIONS.windowMs,
  max: RATE_LIMIT_CONFIG.WALLET_OPERATIONS.max,
  message: {
    error: 'Too many wallet address update requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skip: skipRateLimitForAdminApiKey,
});

export const sessionLoginRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.SESSION_LOGIN.windowMs,
  max: RATE_LIMIT_CONFIG.SESSION_LOGIN.max,
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Key by IP + communityId to avoid different communities sharing the same rate limit bucket.
  // Cloud Run users behind the same NAT/proxy share an IP, so per-IP-only limits are too strict.
  keyGenerator: (req: Request) => {
    const communityId = req.headers['x-community-id'] as string | undefined;
    return `${req.ip}:${communityId || 'unknown'}`;
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
