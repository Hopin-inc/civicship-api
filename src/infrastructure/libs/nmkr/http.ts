import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

export class NmkrHttpError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly statusCode: number,
    public readonly nmkrError?: string,
  ) {
    super(`NMKR API Error: ${endpoint} (${statusCode}): ${nmkrError || 'Unknown error'}`);
    this.name = 'NmkrHttpError';
  }

  toLogSafeString(): string {
    const safeEndpoint = this.endpoint.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]');
    return `NMKR API Error: ${safeEndpoint} (${this.statusCode}): ${this.nmkrError || 'Unknown error'}`;
  }
}

export class NmkrHttp {
  constructor(private readonly http: AxiosInstance) {}

  async getJSON<T>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.get<string>(url, { 
      responseType: 'text', 
      ...cfg 
    });
    return this.parseResponse<T>(data);
  }

  async postJSON<T, B = unknown>(url: string, body?: B, cfg?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.post<string>(url, body, { 
      responseType: 'text', 
      ...cfg 
    });
    return this.parseResponse<T>(data);
  }

  async putJSON<T, B = unknown>(url: string, body?: B, cfg?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.put<string>(url, body, { 
      responseType: 'text', 
      ...cfg 
    });
    return this.parseResponse<T>(data);
  }

  async deleteJSON<T>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.http.delete<string>(url, { 
      responseType: 'text', 
      ...cfg 
    });
    return this.parseResponse<T>(data);
  }

  private parseResponse<T>(raw: unknown): T {
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as T;
      }
    }
    return raw as T;
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
        throw new NmkrHttpError(
          response.config.url || "unknown",
          response.status,
          data.errorMessage,
        );
      }
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as any;
      
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
        throw new NmkrHttpError(
          error.config?.url || "unknown",
          error.response.status,
          error.message,
        );
      }
      throw error;
    },
  );

  return client;
};
