import axios, { AxiosInstance } from "axios";
import { instrumentAxios } from "./axios-instrumentation";

export type HttpClientOptions = {
  baseURL?: string;
  timeoutMs?: number;
  keepAlive?: boolean;
  label?: string;
};

export function createHttpClient(options?: HttpClientOptions): AxiosInstance {
  const { baseURL, timeoutMs = 15_000, keepAlive = true } = options ?? {};

  const instance = axios.create({
    baseURL,
    timeout: timeoutMs,
    ...(keepAlive && {
      httpAgent: new (require("http").Agent)({ keepAlive: true }),
      httpsAgent: new (require("https").Agent)({ keepAlive: true }),
    }),
  });

  return instrumentAxios(instance);
}
