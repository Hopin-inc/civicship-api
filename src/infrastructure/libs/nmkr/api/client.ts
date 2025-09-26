import { injectable } from "tsyringe";
import { createNmkrHttpClient, NmkrApiError } from "./http";
import { NmkrEndpoints } from "./endpoints";
import {
  CreatePaymentTransactionRequest,
  CreatePaymentTransactionResponse,
  CreateWalletResponse,
  MintAndSendSpecificResponse,
  UploadNftRequest,
  UploadNftResponse,
} from "@/infrastructure/libs/nmkr/type";

@injectable()
export class NmkrClient {
  private readonly endpoints: NmkrEndpoints;

  constructor() {
    const httpClient = createNmkrHttpClient();
    this.endpoints = new NmkrEndpoints(httpClient);
  }

  private async handleRequest<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (error instanceof NmkrApiError) {
        throw error;
      }
      throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createSpecificNftSale(
    payload: CreatePaymentTransactionRequest,
  ): Promise<CreatePaymentTransactionResponse> {
    return this.handleRequest(
      () => this.endpoints.createPaymentTransactionForSpecificNft(payload),
      "Failed to create specific NFT sale",
    );
  }

  async createWallet(
    customerId: number,
    options: { walletName: string; enterpriseaddress: boolean; walletPassword: string },
  ): Promise<CreateWalletResponse> {
    return this.handleRequest(
      () => this.endpoints.createWallet(customerId, options),
      "Failed to create NMKR wallet",
    );
  }

  async uploadNft(
    projectUid: string,
    payload: UploadNftRequest,
    uploadSource?: string,
  ): Promise<UploadNftResponse> {
    return this.handleRequest(
      () => this.endpoints.uploadNft(projectUid, payload, uploadSource),
      "Failed to create NMKR wallet",
    );
  }

  async mintAndSendSpecific(
    projectUid: string,
    nftUid: string,
    tokenCount: number,
    receiverAddress: string,
    blockchain: string = "Cardano",
  ): Promise<MintAndSendSpecificResponse> {
    return this.handleRequest(
      () =>
        this.endpoints.mintAndSendSpecific(
          projectUid,
          nftUid,
          tokenCount,
          receiverAddress,
          blockchain,
        ),
      "Failed to mint and send NFT via NMKR",
    );
  }
}
