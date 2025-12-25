import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

export class CardanoShopifyAppApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly rawBody: unknown,
    public readonly url: string,
  ) {
    super(`CardanoShopifyApp ${status} ${url}`);
    this.name = "CardanoShopifyAppApiError";
  }
}

function isAxiosError(e: unknown): e is AxiosError {
  return !!e && typeof e === "object" && "isAxiosError" in e;
}

export class CardanoShopifyAppHttp {
  constructor(private readonly http: AxiosInstance) {}

  private parseResponse<T>(raw: unknown): T {
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as T;
      } catch {
        /* text/plain etc. */
      }
    }
    return raw as T;
  }

  async getJSON<T>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
    const config: AxiosRequestConfig = { responseType: "text", timeout: 15000, ...cfg };

    const maxRetries = cfg?.timeout && cfg.timeout > 30_000 ? 3 : 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await this.http.get<string>(url, config);
        if (res.status >= 200 && res.status < 300) return this.parseResponse<T>(res.data);
        throw new CardanoShopifyAppApiError(res.status, res.data, url);
      } catch (error: unknown) {
        lastError = error;
        if (
          attempt < maxRetries &&
          isAxiosError(error) &&
          (error.code === "ECONNABORTED" || error.message?.includes("timeout"))
        ) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        if (isAxiosError(error) && error.response) {
          throw new CardanoShopifyAppApiError(error.response.status ?? 0, error.response.data, url);
        }
        throw error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Unknown HTTP error");
  }

  async postJSON<T, B = unknown>(url: string, body: B, cfg?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.http.post<string>(url, body, { responseType: "text", ...cfg });
      if (res.status >= 200 && res.status < 300) return this.parseResponse<T>(res.data);
      throw new CardanoShopifyAppApiError(res.status, res.data, url);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        throw new CardanoShopifyAppApiError(error.response.status ?? 0, error.response.data, url);
      }
      throw error;
    }
  }
}

export const createCardanoShopifyAppHttpClient = (): AxiosInstance => {
  const baseURL = process.env.CARDANO_SHOPIFY_APP_API_URL!;
  const apiKey = process.env.CARDANO_SHOPIFY_APP_API_KEY!;

  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    transformResponse: [
      (data) => {
        if (typeof data === "string") {
          try {
            return JSON.parse(data);
          } catch {
            return data;
          }
        }
        return data;
      },
    ],
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { __retryCount?: number };

      if (
        error.response?.status === 429 ||
        (error.response?.status && error.response.status >= 500)
      ) {
        config.__retryCount = config.__retryCount || 0;

        if (config.__retryCount < 3) {
          config.__retryCount++;
          const delay = Math.pow(2, config.__retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return client(config);
        }
      }

      if (error.response) {
        throw new CardanoShopifyAppApiError(
          error.response.status,
          error.response.data,
          error.config?.url || "unknown",
        );
      }
      throw error;
    },
  );

  return client;
};
