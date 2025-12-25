import { injectable } from "tsyringe";
import { createCardanoShopifyAppHttpClient, CardanoShopifyAppApiError } from "./http";
import { CardanoShopifyAppEndpoints } from "./endpoints";
import {
  GetAddressResponseDto,
  GetNftsResponseDto,
} from "@/infrastructure/libs/cardanoShopifyApp/type";

@injectable()
export class CardanoShopifyAppClient {
  private readonly endpoints: CardanoShopifyAppEndpoints;

  constructor() {
    const httpClient = createCardanoShopifyAppHttpClient();
    this.endpoints = new CardanoShopifyAppEndpoints(httpClient);
  }

  private async handleRequest<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (error instanceof CardanoShopifyAppApiError) {
        throw error;
      }
      throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getOrCreateAddress(token: string): Promise<GetAddressResponseDto> {
    return this.handleRequest(
      () => this.endpoints.getOrCreateAddress(token),
      "Failed to get or create Cardano wallet address",
    );
  }

  async getNftsByAddress(address: string): Promise<GetNftsResponseDto> {
    return this.handleRequest(
      () => this.endpoints.getNftsByAddress(address),
      "Failed to get NFTs by address from Cardano Shopify App",
    );
  }

  async health(): Promise<void> {
    await this.handleRequest(
      () => this.endpoints.health(),
      "Cardano Shopify App health check failed",
    );
  }
}
