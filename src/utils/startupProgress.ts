import { performance } from "node:perf_hooks";

/**
 * Prints per-step startup progress lines to stdout so local runs show which
 * phase of bootstrap is slow. Only active when `LOCAL_DEV=true` is set by a
 * local-facing npm script (`pnpm dev*`), mirroring the gate used by
 * `src/utils/envBanner.ts`. In Cloud Run / GCP the flag is never set, so these
 * calls become no-ops and the existing structured `logger.info` output is
 * preserved.
 *
 * Usage:
 *   startProgress(7);
 *   step("Environment loaded");
 *   ...
 *   done(`Server ready at ${url}`);
 */
// Read `LOCAL_DEV` at call time (matching the pattern used by
// `src/utils/envBanner.ts`) so test setups or programmatic entrypoints that
// toggle the env var after module import still get the correct behavior.
function isEnabled(): boolean {
  return process.env.LOCAL_DEV === "true";
}

let totalSteps = 0;
let currentStep = 0;
let startMark = 0;
let lastMark = 0;

export function startProgress(total: number): void {
  if (!isEnabled()) return;
  totalSteps = total;
  currentStep = 0;
  startMark = performance.now();
  lastMark = startMark;
}

export function step(label: string): void {
  if (!isEnabled()) return;
  currentStep += 1;
  const now = performance.now();
  const ms = Math.round(now - lastMark);
  lastMark = now;
  console.log(`[${currentStep}/${totalSteps}] ✓ ${label} (${ms}ms)`);
}

export function done(label: string): void {
  if (!isEnabled()) return;
  currentStep += 1;
  const now = performance.now();
  const ms = Math.round(now - lastMark);
  const total = Math.round(now - startMark);
  lastMark = now;
  console.log(`[${currentStep}/${totalSteps}] 🚀 ${label} (${ms}ms, total ${total}ms)`);
}

export function isProgressEnabled(): boolean {
  return isEnabled();
}
