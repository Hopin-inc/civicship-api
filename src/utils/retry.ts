import { fetchData } from "@/utils/fetch";
import logger from "@/infrastructure/logging";

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithRetry = async <T>(
  url: string,
  maxRetries: number = 3,
  delayMs: number = 1000,
  timeout: number = 60000,
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchData<T>(url, { timeout });
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      logger.warn(`Retry ${i + 1}/${maxRetries} after ${delayMs}ms for ${url}`);
      await delay(delayMs);
    }
  }
  throw new Error("unreachable");
};
