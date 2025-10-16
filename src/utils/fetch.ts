import fetch, { RequestInit, ResponseInit } from "node-fetch";

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export const fetchData = async <T = unknown>(
  url: string,
  init?: FetchOptions,
  onError?: (response: ResponseInit) => void,
): Promise<T> => {
  const timeout = init?.timeout || 30000; // Default 30 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (onError) {
        onError(response);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }

    return await response.json() as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    
    throw error;
  }
};
