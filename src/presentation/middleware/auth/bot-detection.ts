/**
 * Bot detection utility for identifying web crawlers and search engine bots
 */

const BOT_USER_AGENT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /crawling/i,
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /rogerbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest\/0\./i,
  /developers\.google\.com\/\+\/web\/snippet/i,
  /slackbot/i,
  /vkShare/i,
  /W3C_Validator/i,
  /redditbot/i,
  /Applebot/i,
  /WhatsApp/i,
  /flipboard/i,
  /tumblr/i,
  /bitlybot/i,
  /SkypeUriPreview/i,
  /nuzzel/i,
  /Discordbot/i,
  /Google Page Speed/i,
  /Qwantify/i,
  /pinterestbot/i,
  /Bitrix link preview/i,
  /XING-contenttabreceiver/i,
  /Chrome-Lighthouse/i,
  /telegrambot/i,
];

/**
 * Combined regex pattern for efficient bot detection
 * Combines all bot patterns into a single regex to avoid loop overhead
 */
const COMBINED_BOT_PATTERN = new RegExp(
  BOT_USER_AGENT_PATTERNS.map((pattern) => pattern.source).join("|"),
  "i"
);

/**
 * Checks if a user agent string belongs to a known bot/crawler
 * @param userAgent - The user agent string from request headers
 * @returns true if the user agent matches known bot patterns
 */
export function isBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;

  return COMBINED_BOT_PATTERN.test(userAgent);
}

/**
 * Bot name patterns for identifying specific bots
 */
const BOT_NAME_PATTERNS = [
  { pattern: /bingbot/i, name: "Bingbot" },
  { pattern: /googlebot/i, name: "Googlebot" },
  { pattern: /baiduspider/i, name: "Baiduspider" },
  { pattern: /yandexbot/i, name: "YandexBot" },
  { pattern: /slurp/i, name: "Yahoo Slurp" },
  { pattern: /duckduckbot/i, name: "DuckDuckBot" },
  { pattern: /facebookexternalhit/i, name: "Facebook Bot" },
  { pattern: /twitterbot/i, name: "Twitterbot" },
  { pattern: /linkedinbot/i, name: "LinkedInBot" },
  { pattern: /slackbot/i, name: "Slackbot" },
  { pattern: /discordbot/i, name: "Discordbot" },
  { pattern: /telegrambot/i, name: "TelegramBot" },
  { pattern: /applebot/i, name: "Applebot" },
  { pattern: /chrome-lighthouse/i, name: "Lighthouse" },
] as const;

/**
 * Extracts bot name from user agent
 * @param userAgent - The user agent string from request headers (must be a bot user agent)
 * @returns The bot name (returns "Unknown Bot" if specific bot cannot be identified)
 */
export function getBotName(userAgent: string): string {
  for (const { pattern, name } of BOT_NAME_PATTERNS) {
    if (pattern.test(userAgent)) {
      return name;
    }
  }

  return "Unknown Bot";
}
