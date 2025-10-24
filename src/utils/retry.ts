import { fetchData } from "@/utils/fetch";
import logger from "@/infrastructure/logging";

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithRetry = async <T>(
  url: string,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
  timeout: number = 60000,
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchData<T>(url, { timeout });
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      const delayWithBackoff = initialDelayMs * 2 ** i;
      const jitter = delayWithBackoff * 0.2 * Math.random();
      const totalDelay = delayWithBackoff + jitter;

      logger.warn(`Retry ${i + 1}/${maxRetries} after ${Math.round(totalDelay)}ms for ${url}`);
      await delay(totalDelay);
    }
  }
  throw new Error("unreachable");
};
