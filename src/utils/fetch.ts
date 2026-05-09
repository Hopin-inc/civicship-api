import fetch, { RequestInit, ResponseInit } from "node-fetch";
import http from "http";
import https from "https";

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

const DEFAULT_HEADERS = {
  'User-Agent': 'civicship-api/1.0',
  'Accept': 'application/json',
};

// Cloud Run Jobs egress cannot reliably reach IPv6 endpoints; AAAA records
// returned by DNS cause TCP SYN to time out (~5–6s ETIMEDOUT). Force IPv4.
const ipv4HttpAgent = new http.Agent({ family: 4, keepAlive: true });
const ipv4HttpsAgent = new https.Agent({ family: 4, keepAlive: true });

const selectAgent = (url: string) => {
  try {
    const { protocol } = new URL(url);
    if (protocol === "https:") return ipv4HttpsAgent;
    if (protocol === "http:") return ipv4HttpAgent;
  } catch {
    // Malformed URL — let node-fetch surface its own error
  }
  return undefined;
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
      agent: init?.agent ?? selectAgent(url),
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
      throw new Error(`Request timeout after ${timeout}ms`, { cause: error });
    }

    throw error;
  }
};
