import { prismaClient } from "./client";
import logger from "@/infrastructure/logging";

/**
 * Warm up Prisma connection pool with timeout and retry logic
 * This ensures the database connection is established before accepting traffic
 */
export async function warmUpPrisma(retries = 3): Promise<void> {
  const startTime = performance.now();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await Promise.race([
        prismaClient.$connect(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Connect timeout")), 5000),
        ),
      ]);

      await Promise.race([
        prismaClient.$queryRaw`SELECT 1`,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout")), 1000),
        ),
      ]);

      const duration = performance.now() - startTime;
      logger.info("✅ Prisma connection pool initialized", {
        duration: `${duration.toFixed(2)}ms`,
      });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Prisma warm-up attempt ${attempt}/${retries} failed`, {
        error: errorMessage,
      });

      if (attempt === retries) {
        logger.error("❌ Failed to initialize Prisma after all retries");
        process.exit(1); // Fail fast for Cloud Run to restart
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 200 * Math.pow(2, attempt - 1)),
      );
    }
  }
}

/**
 * Health check function for database connectivity
 * Returns true if database is reachable, false otherwise
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await Promise.race([
      prismaClient.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Health check timeout")), 1000),
      ),
    ]);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Health check failed", { error: errorMessage });
    return false;
  }
}
