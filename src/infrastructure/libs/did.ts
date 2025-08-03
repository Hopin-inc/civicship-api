import axios from "axios";
import { injectable } from "tsyringe";
import { IDENTUS_API_URL } from "@/consts/utils";
import logger from "@/infrastructure/logging";

@injectable()
export class DIDVCServerClient {
  async call<T>(
    uid: string,
    token: string,
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${IDENTUS_API_URL}${endpoint}`;
    const headers = {
      "x-api-key": process.env.API_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    logger.debug("[DIDVCClient] Request", { method, url, uid, headers, data });

    try {
      let response;
      switch (method) {
        case "GET":
          response = await axios.get(url, { headers });
          break;
        case "POST":
          response = await axios.post(url, data, { headers });
          break;
        case "PUT":
          response = await axios.put(url, data, { headers });
          break;
        case "DELETE":
          response = await axios.delete(url, { headers });
          break;
      }

      logger.debug("[DIDVCClient] Response", { status: response?.status, data: response?.data });
      return response?.data as T;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error("[DIDVCClient] Error", {
          url,
          method,
          uid,
          status: error.response?.status,
          response: error.response?.data,
          message: error.message,
        });
      } else if (error instanceof Error) {
        logger.error("[DIDVCClient] Error", {
          url,
          method,
          uid,
          message: error.message,
        });
      } else {
        logger.error("[DIDVCClient] Unknown Error", {
          url,
          method,
          uid,
          error,
        });
      }
      throw error;
    }
  }
}
