import rateLimit from 'express-rate-limit';

const RATE_LIMIT_CONFIG = {
  WALLET_OPERATIONS: {
    windowMs: 1000, // 1 second
    max: 1, // 1 request per second for wallet operations
  },
  GENERAL_API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes for general API operations
  },
} as const;

export const walletRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WALLET_OPERATIONS.windowMs,
  max: RATE_LIMIT_CONFIG.WALLET_OPERATIONS.max,
  message: {
    error: 'Too many wallet address update requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skip: (req) => {
    const apiKey = req.headers['x-api-key'] as string;
    const adminApiKey = process.env.CIVICSHIP_ADMIN_API_KEY;
    
    const hasValidApiKey = apiKey && adminApiKey && apiKey === adminApiKey;
    return !!hasValidApiKey;
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
