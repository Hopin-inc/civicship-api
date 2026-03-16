import fetch, { RequestInit, ResponseInit } from "node-fetch";

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

const DEFAULT_HEADERS = {
  'User-Agent': 'civicship-api/1.0',
  'Accept': 'application/json',
};

function isAbortError(error: unknown): boolean {
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  if (typeof error === 'object' && error !== null && (error as { type?: string }).type === 'aborted') {
    return true;
  }
  return false;
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
      headers: {
        ...DEFAULT_HEADERS,
        ...init?.headers,
      },
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

    if (isAbortError(error)) {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw error;
  }
};
