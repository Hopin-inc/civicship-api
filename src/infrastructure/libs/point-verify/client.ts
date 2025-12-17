import axios from "axios";
import { injectable } from "tsyringe";
import { IDENTUS_API_URL } from "@/consts/utils";
import logger from "@/infrastructure/logging";

export interface VerifyRequest {
  txIds: string[];
}

export interface VerifyResponse {
  txId: string;
  status: "verified" | "not_verified";
  transactionHash: string;
  rootHash: string;
  label: number;
}

@injectable()
export class PointVerifyClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = IDENTUS_API_URL;
  }

  async verifyTransactions(txIds: string[]): Promise<VerifyResponse[]> {
    const url = `${this.baseUrl}/point/verify`;
    const requestBody: VerifyRequest = { txIds };

    logger.debug("[PointVerifyClient] Request", { url, body: requestBody });

    try {
      const response = await axios.post<VerifyResponse[]>(url, requestBody, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      });

      logger.debug("[PointVerifyClient] Response", {
        status: response.status,
        count: response.data.length,
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error("[PointVerifyClient] Axios Error", {
          url,
          status: error.response?.status,
          response: error.response?.data,
          message: error.message,
        });
      } else {
        logger.error("[PointVerifyClient] Unknown Error", { error });
      }
      throw error;
    }
  }
}
