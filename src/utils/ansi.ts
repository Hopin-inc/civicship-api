/**
 * Shared ANSI color codes and banner helpers used by local startup banners
 * (`src/utils/envBanner.ts`) and the prd confirmation prompt
 * (`scripts/confirmPrd.ts`). Keep these in one place so the styles stay in
 * sync across every entry point.
 */
export const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgGreen: "\x1b[42m",
  fgWhite: "\x1b[37m",
  fgBlack: "\x1b[30m",
} as const;

export const BANNER_WIDTH = 60;
export const BANNER_LINE = "=".repeat(BANNER_WIDTH);
