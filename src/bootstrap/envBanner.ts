/**
 * Prints a startup banner indicating which environment the server is running against.
 *
 * Only prints when running via the local `pnpm dev*` scripts, which inject
 * `LOCAL_DEV=true`. In Cloud Run / GCP the banner is suppressed because that
 * flag is never set there.
 *
 * Environment is determined by `process.env.ENV`, which is populated from the
 * env file loaded by the local startup script (`.env` for `pnpm dev` / `pnpm dev:external`,
 * `.env.local` / `.env.dev` / `.env.prd` for `pnpm dev:https[:dev|:prd]`).
 * Production-like environments are emphasized with ⚠️ and color to reduce the risk of
 * accidentally operating against prd from a local machine.
 */
export function printEnvBanner(): void {
  if (process.env.LOCAL_DEV !== "true") return;

  const env = (process.env.ENV ?? "").toUpperCase();
  const nodeEnv = process.env.NODE_ENV ?? "";
  const isProd = env === "PRD" || env === "PROD" || env === "PRODUCTION" || nodeEnv === "production";
  const isDev = env === "DEV" || env === "DEVELOPMENT";

  // ANSI color codes
  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  const bgRed = "\x1b[41m";
  const bgYellow = "\x1b[43m";
  const bgGreen = "\x1b[42m";
  const fgWhite = "\x1b[37m";
  const fgBlack = "\x1b[30m";

  const displayEnv = env || "LOCAL";
  const line = "=".repeat(60);

  if (isProd) {
    console.log("");
    console.log(`${bgRed}${fgWhite}${bold}${line}${reset}`);
    console.log(
      `${bgRed}${fgWhite}${bold}  ⚠️  WARNING: PRODUCTION ENVIRONMENT (ENV=${displayEnv})  ⚠️${reset}`,
    );
    console.log(`${bgRed}${fgWhite}${bold}${line}${reset}`);
    console.log("");
  } else if (isDev) {
    console.log("");
    console.log(`${bgYellow}${fgBlack}${bold}  🔧 DEV environment (ENV=${displayEnv})  ${reset}`);
    console.log("");
  } else {
    console.log("");
    console.log(`${bgGreen}${fgBlack}${bold}  💻 LOCAL environment (ENV=${displayEnv})  ${reset}`);
    console.log("");
  }
}
