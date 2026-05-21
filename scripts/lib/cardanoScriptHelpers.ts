/**
 * Shared helpers for one-shot Cardano operator scripts.
 *
 * Used by `scripts/derive-platform-address.ts` and
 * `scripts/preprod-e2e-submit.ts` (and any future sibling script that needs
 * to validate hex env input or stream step-by-step output).
 *
 * Kept under `scripts/lib/` so it's clearly script-local and not part of
 * the application graph — these helpers intentionally do NOT depend on the
 * DI container, Prisma, or `@/infrastructure/*` modules.
 */

export type StepResult<T = void> =
  | { name: string; ok: true; value: T; detail: string }
  | { name: string; ok: false; detail: string };

/**
 * Run a labelled step, printing `-> name ...` / `   PASS|FAIL: detail` so
 * the GitHub Actions / terminal log surfaces precisely which dependency
 * broke (mirrors the format used by `scripts/cardano-canary.ts`).
 *
 * `fn` returns `{ value, detail }` so callers can thread a result through
 * to the next step without needing non-null assertions on outer
 * variables. For void steps, return `{ value: undefined, detail }`.
 */
export async function runStep<T>(
  name: string,
  fn: () => Promise<{ value: T; detail: string }>,
): Promise<StepResult<T>> {
  process.stdout.write(`-> ${name} ...\n`);
  try {
    const { value, detail } = await fn();
    process.stdout.write(`   PASS: ${detail}\n`);
    return { name, ok: true, value, detail };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stdout.write(`   FAIL: ${msg}\n`);
    return { name, ok: false, detail: msg };
  }
}

/**
 * Parse a fixed-length hex string into raw bytes. The `label` is woven into
 * error messages so the operator sees which env var was malformed.
 */
export function parseFixedLengthHex(
  hex: string,
  expectedBytes: number,
  label: string,
): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const expectedHexLen = expectedBytes * 2;
  if (clean.length !== expectedHexLen) {
    throw new Error(
      `${label} must be ${expectedHexLen} hex chars (${expectedBytes} bytes), got ${clean.length}`,
    );
  }
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error(`${label} contains non-hex characters`);
  }
  const out = new Uint8Array(expectedBytes);
  for (let i = 0; i < expectedBytes; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Lowercase hex encoding (no `0x` prefix). */
export function bytesToHex(b: Uint8Array): string {
  let s = "";
  for (const byte of b) s += byte.toString(16).padStart(2, "0");
  return s;
}

/**
 * Run a script's `main` to completion and exit the process with its returned
 * code. `cleanup` (e.g. `() => prismaClient.$disconnect()`) always runs first,
 * on both the success and failure paths; on an uncaught error the stack is
 * written to stderr and the process exits 1.
 *
 * `main` and `cleanup` are invoked behind `await` inside an async wrapper so a
 * *synchronous* throw from either is normalized into the same handling path as
 * a rejected promise — the exit code is always honoured and a `cleanup`
 * failure never escapes as an unhandled rejection.
 *
 * `cleanup` is passed in (rather than imported) so this module keeps its
 * "no DI container / no Prisma / no `@/infrastructure`" constraint — every
 * one-shot script otherwise repeats this same boilerplate verbatim.
 */
export function runScript(
  main: () => Promise<number>,
  cleanup: () => Promise<unknown> = () => Promise.resolve(),
): void {
  void (async () => {
    let code = 1;
    try {
      code = await main();
    } catch (err) {
      process.stderr.write(
        `ERROR: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`,
      );
    }
    try {
      await cleanup();
    } catch (err) {
      // The process is already terminating; a cleanup failure must not mask
      // the exit code or surface as an unhandled rejection.
      process.stderr.write(
        `WARN: cleanup failed: ${err instanceof Error ? err.message : String(err)}\n`,
      );
    }
    process.exit(code);
  })();
}

/**
 * CLI flags common to one-shot backfill scripts:
 *   - `confirm` — `--confirm` toggles execute mode (otherwise dry-run).
 *   - `limit`   — `--limit=<n>` caps the number of rows processed.
 */
export interface ConfirmLimitFlags {
  confirm: boolean;
  limit?: number;
}

/**
 * Parse the `--confirm` / `--limit=<n>` flags. Throws on an unknown flag or a
 * non-positive `--limit`. Extracted because every backfill script otherwise
 * repeats this exact parser verbatim.
 */
export function parseConfirmLimitFlags(argv: string[]): ConfirmLimitFlags {
  const flags: ConfirmLimitFlags = { confirm: false };
  for (const arg of argv) {
    if (arg === "--confirm") {
      flags.confirm = true;
      continue;
    }
    const limit = /^--limit=(\d+)$/.exec(arg);
    if (limit) {
      flags.limit = Number.parseInt(limit[1], 10);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }
  if (flags.limit !== undefined && flags.limit <= 0) {
    throw new Error("--limit must be > 0");
  }
  return flags;
}
