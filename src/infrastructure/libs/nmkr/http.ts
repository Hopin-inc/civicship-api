import axios, { AxiosInstance } from "axios";

export const createNmkrHttpClient = (): AxiosInstance => {
  const baseURL = process.env.NMKR_BASE_URL!;
  const apiKey = process.env.NMKR_API_KEY!;
  return axios.create({
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
};
