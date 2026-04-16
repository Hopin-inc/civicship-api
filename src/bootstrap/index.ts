import "reflect-metadata";
import { printEnvBanner } from "@/utils/envBanner";
import { startProgress, step } from "@/utils/startupProgress";

printEnvBanner();
// In batch mode, `main()` in `src/index.ts` short-circuits before the
// server-startup steps fire, so the progress would otherwise stop at [2/7].
startProgress(process.env.PROCESS_TYPE === "batch" ? 2 : 7);
step("Environment loaded");

const { tracingReady } = await import("@/infrastructure/logging/tracing");
await tracingReady;
step("Tracing initialized");

await import("../index");
