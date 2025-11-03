import http from "http";
import { prismaClient } from "./client";
import logger from "@/infrastructure/logging";

/**
 * Setup graceful shutdown handlers for SIGTERM and SIGINT
 * Ensures proper cleanup of HTTP server and database connections
 */
export function setupGracefulShutdown(server: http.Server): void {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, starting graceful shutdown`);

    server.close(() => {
      logger.info("HTTP server closed");
    });

    try {
      await prismaClient.$disconnect();
      logger.info("Prisma disconnected");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Error disconnecting Prisma", { error: errorMessage });
    }

    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
