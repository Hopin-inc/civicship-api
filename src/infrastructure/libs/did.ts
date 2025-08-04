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
      "x-api-key": process.env.IDENTUS_API_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    logger.debug(`[DIDVCClient] ${method} ${url} for uid=${uid}`);

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

      return response?.data as T;
    } catch (error) {
      logger.error(`Error calling DID/VC server at ${endpoint}:`, error);
      throw error;
    }
  }
}
