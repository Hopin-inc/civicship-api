import { AxiosInstance } from "axios";
import { NmkrHttp } from "./http";
import type {
  CreatePaymentTransactionRequestBody,
} from "../types/types.aliases";
import type { components } from "../types/openapi";
import type { CreateWalletResponse } from "../types/types.generated";

export class NmkrEndpoints {
  private readonly http2: NmkrHttp;

  constructor(http: AxiosInstance) {
    this.http2 = new NmkrHttp(http);
  }

  async createPaymentTransactionForSpecificNft(
    apikey: string,
    nftprojectid: string,
    payload: CreatePaymentTransactionRequestBody,
  ): Promise<components["schemas"]["GetPaymentAddressResultClass"]> {
    return this.http2.postJSON<
      components["schemas"]["GetPaymentAddressResultClass"],
      CreatePaymentTransactionRequestBody
    >(`/GetAddressForSpecificNftSale/${apikey}/${nftprojectid}`, payload);
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
