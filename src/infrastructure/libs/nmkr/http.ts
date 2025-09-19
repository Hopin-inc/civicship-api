import axios, { AxiosInstance, AxiosError } from "axios";

export class NmkrHttpError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly statusCode: number,
    public readonly nmkrError?: string,
  ) {
    super(`NMKR API Error: ${endpoint} (${statusCode}): ${nmkrError || 'Unknown error'}`);
    this.name = 'NmkrHttpError';
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
    (error: AxiosError) => {
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
