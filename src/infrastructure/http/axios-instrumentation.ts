import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { getPerfAggregator, getCorrelationId } from "@/infrastructure/observability/als";

const startTimes = new WeakMap<InternalAxiosRequestConfig, number>();

export function instrumentAxios(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const correlationId = getCorrelationId();
    if (correlationId && config.headers) {
      config.headers["X-Correlation-Id"] = correlationId;
    }
    
    startTimes.set(config, performance.now());
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const startTime = startTimes.get(response.config);
      if (typeof startTime === "number") {
        const duration = performance.now() - startTime;
        const aggregator = getPerfAggregator();
        if (aggregator) {
          let host: string | undefined;
          let path: string | undefined;
          try {
            const url = new URL(
              response.config.url ?? "",
              response.config.baseURL ?? "http://localhost"
            );
            host = url.hostname;
            path = url.pathname;
          } catch {
            path = response.config.url ?? "";
          }

          aggregator.add("http.external", duration, {
            method: response.config.method?.toUpperCase(),
            host,
            path,
            status: response.status,
            durationMs: Number(duration.toFixed(2)),
          });
        }
        startTimes.delete(response.config);
      }
      return response;
    },
    (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig | undefined;
      if (config) {
        const startTime = startTimes.get(config);
        if (typeof startTime === "number") {
          const duration = performance.now() - startTime;
          const aggregator = getPerfAggregator();
          if (aggregator) {
            aggregator.add("http.external", duration, {
              method: config.method?.toUpperCase(),
              status: error.response?.status || 0,
              error: true,
              durationMs: Number(duration.toFixed(2)),
            });
          }
          startTimes.delete(config);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const instrumentedAxios = instrumentAxios(axios.create());
