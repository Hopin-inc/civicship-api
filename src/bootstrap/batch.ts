import "reflect-metadata";
import { tracingReady } from "@/infrastructure/logging/tracing";

await tracingReady;

await import("../index");
