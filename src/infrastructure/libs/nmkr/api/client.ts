import { injectable } from "tsyringe";
import { createNmkrHttpClient, NmkrApiError } from "./http";
import { NmkrEndpoints } from "./endpoints";

type Res<T extends (...a: any) => any> = Awaited<ReturnType<T>>;

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

  async createSpecificNftSale(payload: any): Promise<any> {
    const { apikey, nftprojectid, ...requestBody } = payload;
    return this.handleRequest(
      () => this.endpoints.createPaymentTransactionForSpecificNft(apikey, nftprojectid, requestBody),
      "Failed to create specific NFT sale",
    );
  }

  async createWallet(
    customerId: number,
    options: { walletName: string; enterpriseaddress: boolean; walletPassword: string },
  ): Promise<Res<NmkrEndpoints["createWallet"]>> {
    return this.handleRequest(
      () => this.endpoints.createWallet(customerId, options),
      "Failed to create NMKR wallet",
    );
  }
}
