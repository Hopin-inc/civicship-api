/**
 * Interactive y/N confirmation prompt used before running any `:prd` npm script.
 *
 * Chained via `&&` in package.json so that the subsequent command runs only
 * when the operator explicitly types `y` or `yes`. Any other input (including
 * an empty line) aborts with a non-zero exit code.
 */
import readline from "readline";

const reset = "\x1b[0m";
const bold = "\x1b[1m";
const bgRed = "\x1b[41m";
const fgWhite = "\x1b[37m";
const line = "=".repeat(60);

const target = process.argv[2] ?? "production";

console.log("");
console.log(`${bgRed}${fgWhite}${bold}${line}${reset}`);
console.log(`${bgRed}${fgWhite}${bold}  ⚠️  PRODUCTION ENVIRONMENT  ⚠️${reset}`);
console.log(`${bgRed}${fgWhite}${bold}${line}${reset}`);
console.log("");
console.log(`You are about to run "${target}" against PRODUCTION.`);
console.log("This may affect real users and/or production data.");
console.log("");

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
