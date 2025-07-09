import axios from "axios";
import { injectable } from "tsyringe";
import { IDENTUS_API_URL, IDENTUS_API_TIMEOUT } from "@/consts/utils";
import logger from "@/infrastructure/logging";

@injectable()
export class DIDVCServerClient {
  async call<T>(
    uid: string,
    token: string,
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: Record<string, unknown>,
    timeout: number = IDENTUS_API_TIMEOUT,
  ): Promise<T | null> {
    const url = `${IDENTUS_API_URL}${endpoint}`;
    const headers = {
      "x-api-key": process.env.API_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    logger.debug(`[DIDVCClient] ${method} ${url} for uid=${uid}`);

    try {
      let response;
      const config = { headers, timeout };
      
      switch (method) {
        case "GET":
          response = await axios.get(url, config);
          break;
        case "POST":
          response = await axios.post(url, data, config);
          break;
        case "PUT":
          response = await axios.put(url, data, config);
          break;
        case "DELETE":
          response = await axios.delete(url, config);
          break;
      }

      return response?.data as T;
    } catch (error) {
      logger.warn(`[DIDVCClient] External API call failed (non-blocking): ${method} ${endpoint}`, {
        uid,
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}
