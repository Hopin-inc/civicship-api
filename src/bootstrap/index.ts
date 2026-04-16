import "reflect-metadata";
import { printEnvBanner } from "@/utils/envBanner";
import { startProgress, step } from "@/utils/startupProgress";

printEnvBanner();
startProgress(7);
step("Environment loaded");

const { tracingReady } = await import("@/infrastructure/logging/tracing");
await tracingReady;
step("Tracing initialized");

await import("../index");
