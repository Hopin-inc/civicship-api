import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

export class NmkrApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly rawBody: unknown,
    public readonly url: string
  ) {
    super(`NMKR ${status} ${url}`);
    this.name = 'NmkrApiError';
  }
}

function isAxiosError(e: unknown): e is AxiosError {
  return !!e && typeof e === 'object' && 'isAxiosError' in e;
}

export class NmkrHttp {
  constructor(private readonly http: AxiosInstance) {}

  private parseResponse<T>(raw: unknown): T {
    if (typeof raw === 'string') {
      try { return JSON.parse(raw) as T; } catch { /* text/plainなどはそのまま */ }
    }
    return raw as T;
  }

  async getJSON<T>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
    const config: AxiosRequestConfig = { responseType: 'text', timeout: 15000, ...cfg };

    const maxRetries = cfg?.timeout && cfg.timeout > 30_000 ? 3 : 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await this.http.get<string>(url, config);
        if (res.status >= 200 && res.status < 300) return this.parseResponse<T>(res.data);
        throw new NmkrApiError(res.status, res.data, url);
      } catch (error: unknown) {
        lastError = error;
        if (
          attempt < maxRetries &&
          isAxiosError(error) &&
          (error.code === 'ECONNABORTED' || error.message?.includes('timeout'))
        ) {
          await new Promise(r => setTimeout(r, 500 * attempt));
          continue;
        }
        if (isAxiosError(error) && error.response) {
          throw new NmkrApiError(error.response.status ?? 0, error.response.data, url);
        }
        throw error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Unknown HTTP error');
  }

  async postJSON<T, B = unknown>(url: string, body: B, cfg?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.post<string>(url, body, { responseType: 'text', ...cfg });
    if (res.status >= 200 && res.status < 300) return this.parseResponse<T>(res.data);
    throw new NmkrApiError(res.status, res.data, url);
  }

  async putJSON<T, B = unknown>(url: string, body: B, cfg?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.put<string>(url, body, { responseType: 'text', ...cfg });
    if (res.status >= 200 && res.status < 300) return this.parseResponse<T>(res.data);
    throw new NmkrApiError(res.status, res.data, url);
  }

  async deleteJSON<T>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.delete<string>(url, { responseType: 'text', ...cfg });
    if (res.status >= 200 && res.status < 300) return this.parseResponse<T>(res.data);
    throw new NmkrApiError(res.status, res.data, url);
  }
}

export const createNmkrHttpClient = (): AxiosInstance => {
  const baseURL = process.env.NMKR_BASE_URL || "https://studio-api.nmkr.io";
  const apiKey = process.env.NMKR_API_KEY!;
  
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "*/*",
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

  client.interceptors.request.use(
    (config) => {
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${apiKey}`;
      }
      
      if (config.url?.includes('MintAndSend') || config.url?.includes('CreatePaymentTransaction')) {
        if (!config.headers['Idempotency-Key']) {
          config.headers['Idempotency-Key'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => {
      const data = response.data;
      if (data && data.result === "Error") {
        throw new NmkrApiError(
          response.status,
          data,
          response.config.url || "unknown"
        );
      }
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { __retryCount?: number };
      
      if (error.response?.status === 429 || (error.response?.status && error.response.status >= 500)) {
        config.__retryCount = config.__retryCount || 0;
        
        if (config.__retryCount < 3) {
          config.__retryCount++;
          const delay = Math.pow(2, config.__retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return client(config);
        }
      }
      
      if (error.response) {
        throw new NmkrApiError(
          error.response.status,
          error.response.data,
          error.config?.url || "unknown"
        );
      }
      throw error;
    },
  );

  return client;
};
