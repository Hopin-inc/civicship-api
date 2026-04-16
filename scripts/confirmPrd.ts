/**
 * Interactive y/N confirmation prompt used before running any `:prd` npm script.
 *
 * Chained via `&&` in package.json so that the subsequent command runs only
 * when the operator explicitly types `y` or `yes`. Any other input (including
 * an empty line) aborts with a non-zero exit code.
 */
import readline from "readline";
import { ANSI, BANNER_LINE } from "../src/utils/ansi";

const target = process.argv[2] ?? "production";

console.log("");
console.log(`${ANSI.bgRed}${ANSI.fgWhite}${ANSI.bold}${BANNER_LINE}${ANSI.reset}`);
console.log(
  `${ANSI.bgRed}${ANSI.fgWhite}${ANSI.bold}  ⚠️  PRODUCTION ENVIRONMENT  ⚠️${ANSI.reset}`,
);
console.log(`${ANSI.bgRed}${ANSI.fgWhite}${ANSI.bold}${BANNER_LINE}${ANSI.reset}`);
console.log("");
console.log(`You are about to run "${target}" against PRODUCTION.`);
console.log("This may affect real users and/or production data.");
console.log("");

// Refuse to run in a non-interactive context (CI, piped shell, etc.) where
// we cannot obtain explicit confirmation. Aborting is always safer than
// accidentally proceeding against production.
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error("Non-interactive terminal detected. Refusing to proceed without confirmation.");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Continue? [y/N] ", (answer) => {
  rl.close();
  const normalized = answer.trim().toLowerCase();
  if (normalized === "y" || normalized === "yes") {
    console.log("Proceeding...\n");
    process.exit(0);
  }
  console.log("Aborted.");
  process.exit(1);
});
