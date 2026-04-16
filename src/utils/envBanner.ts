import { ANSI, BANNER_LINE } from "@/utils/ansi";

/**
 * Prints a startup banner indicating which environment the current local run is using.
 *
 * Only prints when `LOCAL_DEV=true` is set by a local-facing npm script. This is not
 * limited to `pnpm dev*`; any local script that injects `LOCAL_DEV=true` (e.g.
 * `pnpm richmenu:deploy*`) will show the banner. In Cloud Run / GCP the banner is
 * suppressed because that flag is never set there.
 *
 * The displayed environment is derived from `process.env.ENV` and `process.env.NODE_ENV`,
 * which are populated from the env file loaded by the invoking script (for example `.env`
 * for `pnpm dev` / `pnpm dev:external`, or `.env.local` / `.env.dev` / `.env.prd` for
 * `pnpm dev:https[:dev|:prd]`). Production-like environments are emphasized with ⚠️ and
 * color to reduce the risk of accidentally operating against prd from a local machine.
 */
export function printEnvBanner(): void {
  if (process.env.LOCAL_DEV !== "true") return;

  const env = (process.env.ENV ?? "").toUpperCase();
  const nodeEnv = process.env.NODE_ENV ?? "";
  const isProd =
    env === "PRD" || env === "PROD" || env === "PRODUCTION" || nodeEnv === "production";
  const isDev = env === "DEV" || env === "DEVELOPMENT";

  const displayEnv = env || "UNSET";
  const displayNodeEnv = nodeEnv || "UNSET";

  if (isProd) {
    console.log("");
    console.log(`${ANSI.bgRed}${ANSI.fgWhite}${ANSI.bold}${BANNER_LINE}${ANSI.reset}`);
    console.log(
      `${ANSI.bgRed}${ANSI.fgWhite}${ANSI.bold}  ⚠️  WARNING: PRODUCTION ENVIRONMENT (ENV=${displayEnv}, NODE_ENV=${displayNodeEnv})  ⚠️${ANSI.reset}`,
    );
    console.log(`${ANSI.bgRed}${ANSI.fgWhite}${ANSI.bold}${BANNER_LINE}${ANSI.reset}`);
    console.log("");
  } else if (isDev) {
    console.log("");
    console.log(
      `${ANSI.bgYellow}${ANSI.fgBlack}${ANSI.bold}  🔧 DEV environment (ENV=${displayEnv}, NODE_ENV=${displayNodeEnv})  ${ANSI.reset}`,
    );
    console.log("");
  } else {
    console.log("");
    console.log(
      `${ANSI.bgGreen}${ANSI.fgBlack}${ANSI.bold}  💻 LOCAL environment (ENV=${displayEnv}, NODE_ENV=${displayNodeEnv})  ${ANSI.reset}`,
    );
    console.log("");
  }
}
