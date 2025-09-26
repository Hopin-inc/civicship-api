import { AxiosInstance } from "axios";
import { NmkrHttp } from "./http";
import type {
  CreatePaymentTransactionRequestBody,
  CreatePaymentTransactionResponse,
} from "../types/types.aliases";
import type { CreateWalletResponse } from "../types/types.generated";

export class NmkrEndpoints {
  private readonly http2: NmkrHttp;

  constructor(http: AxiosInstance) {
    this.http2 = new NmkrHttp(http);
  }

  async createPaymentTransactionForSpecificNft(
    payload: CreatePaymentTransactionRequestBody,
  ): Promise<CreatePaymentTransactionResponse> {
    return this.http2.postJSON<
      CreatePaymentTransactionResponse,
      CreatePaymentTransactionRequestBody
    >("/v2/CreatePaymentTransaction", payload);
  }

  async createWallet(
    customerId: number,
    options: { walletName: string; enterpriseaddress: boolean; walletPassword: string },
  ): Promise<CreateWalletResponse> {
    return this.http2.postJSON<CreateWalletResponse, typeof options>(
      `/v2/CreateWallet/${customerId}`,
      options,
    );
  }
}
