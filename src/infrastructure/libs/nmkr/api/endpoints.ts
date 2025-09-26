import { AxiosInstance } from "axios";
import { NmkrHttp } from "./http";
import {
  CreatePaymentTransactionRequest,
  CreatePaymentTransactionResponse,
  CreateWalletResponse,
  MintAndSendSpecificResponse,
  UploadNftRequest,
  UploadNftResponse,
} from "@/infrastructure/libs/nmkr/type";

export class NmkrEndpoints {
  private readonly http2: NmkrHttp;

  constructor(http: AxiosInstance) {
    this.http2 = new NmkrHttp(http);
  }

  async createPaymentTransactionForSpecificNft(
    payload: CreatePaymentTransactionRequest,
  ): Promise<CreatePaymentTransactionResponse> {
    return this.http2.postJSON<CreatePaymentTransactionResponse, CreatePaymentTransactionRequest>(
      "/v2/CreatePaymentTransaction",
      payload,
    );
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

  async uploadNft(
    projectUid: string,
    payload: UploadNftRequest,
    uploadSource?: string,
  ): Promise<UploadNftResponse> {
    const query = uploadSource ? `?uploadsource=${encodeURIComponent(uploadSource)}` : "";
    return this.http2.postJSON<UploadNftResponse, UploadNftRequest>(
      `/v2/UploadNft/${projectUid}${query}`,
      payload,
    );
  }

  async mintAndSendSpecific(
    projectUid: string,
    nftUid: string,
    tokenCount: number,
    receiverAddress: string,
    blockchain: string = "Cardano",
  ): Promise<MintAndSendSpecificResponse> {
    const path = `/v2/MintAndSendSpecific/${projectUid}/${nftUid}/${tokenCount}/${receiverAddress}?blockchain=${encodeURIComponent(
      blockchain,
    )}`;
    return this.http2.getJSON<MintAndSendSpecificResponse>(path);
  }
}
