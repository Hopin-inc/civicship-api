import { fetchData } from "@/utils/fetch";
import logger from "@/infrastructure/logging";

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithRetry = async <T>(
  url: string,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  timeout: number = 60000,
  attempt: number = 0,
): Promise<T> => {
  try {
    return await fetchData<T>(url, { timeout });
  } catch (error) {
    if (attempt < maxRetries) {
      logger.warn(`Retry ${attempt + 1}/${maxRetries} after ${retryDelay}ms for ${url}`);
      await delay(retryDelay);
      return fetchWithRetry<T>(url, maxRetries, retryDelay, timeout, attempt + 1);
    }
    throw error;
  }
};
