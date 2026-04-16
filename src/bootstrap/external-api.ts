import "reflect-metadata";
import { printEnvBanner } from "./envBanner";

printEnvBanner();

const { tracingReady } = await import("@/infrastructure/logging/tracing");
await tracingReady;

await import("../external-api");
