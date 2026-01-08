import axios from "axios";
import { injectable } from "tsyringe";
import { IDENTUS_API_URL } from "@/consts/utils";
import logger from "@/infrastructure/logging";

export interface VerifyRequest {
  txIds: string[];
}

export interface VerifyResponse {
  txId: string;
  status: "verified" | "not_verified" | "pending" | "error";
  transactionHash: string;
  rootHash: string;
  label: number;
}

@injectable()
export class PointVerifyClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = IDENTUS_API_URL;

    // 環境変数が正しく設定されているか検証
    if (!this.baseUrl || this.baseUrl === "https://kyoso-identus-api.example.com") {
      const errorMessage = "[PointVerifyClient] IDENTUS_API_URL is not configured.";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * レスポンスアイテムが有効な VerifyResponse 型かどうかを検証するヘルパー関数
   */
  private isValidVerifyResponse(item: unknown): item is VerifyResponse {
    if (!item || typeof item !== "object") {
      return false;
    }

    const response = item as Record<string, unknown>;
    const validStatuses = ["verified", "not_verified", "pending", "error"];

    return (
      typeof response.txId === "string" &&
      typeof response.status === "string" &&
      validStatuses.includes(response.status) &&
      typeof response.transactionHash === "string" &&
      typeof response.rootHash === "string" &&
      typeof response.label === "number"
    );
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

      const data = response.data;

      // 配列であることを検証
      if (!Array.isArray(data)) {
        logger.error("[PointVerifyClient] Invalid response format: data is not an array", {
          url,
          status: response.status,
          data,
        });
        throw new Error("PointVerifyClient: Invalid response format (data is not an array)");
      }

      // 各要素の必須フィールドを検証
      for (const item of data) {
        if (!this.isValidVerifyResponse(item)) {
          logger.error("[PointVerifyClient] Invalid response item format", {
            url,
            status: response.status,
            item,
          });
          throw new Error("PointVerifyClient: Invalid response item format");
        }
      }

      logger.debug("[PointVerifyClient] Response", {
        status: response.status,
        count: data.length,
      });

      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error("[PointVerifyClient] Axios Error", {
          url,
          status: error.response?.status,
          response: error.response?.data,
          message: error.message,
        });
      } else if (error instanceof Error) {
        logger.error("[PointVerifyClient] Error", {
          url,
          message: error.message,
        });
      } else {
        logger.error("[PointVerifyClient] Unknown Error", { error });
      }

      // エラーを抽象化してラップしつつ、元のエラーを cause として保持
      throw new Error("Failed to communicate with the transaction verification service.", {
        cause: error,
      });
    }
  }
}
