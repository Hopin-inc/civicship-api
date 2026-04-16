import "reflect-metadata";
import { tracingReady } from "@/infrastructure/logging/tracing";
import { printEnvBanner } from "./envBanner";

printEnvBanner();

await tracingReady;

await import("../index");
