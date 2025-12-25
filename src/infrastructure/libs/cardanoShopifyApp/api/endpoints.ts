import { AxiosInstance } from "axios";
import { CardanoShopifyAppHttp } from "./http";
import {
  GetAddressRequestDto,
  GetAddressResponseDto,
  GetNftsResponseDto,
} from "@/infrastructure/libs/cardanoShopifyApp/type";

export class CardanoShopifyAppEndpoints {
  private readonly http: CardanoShopifyAppHttp;

  constructor(httpClient: AxiosInstance) {
    this.http = new CardanoShopifyAppHttp(httpClient);
  }

  async getOrCreateAddress(token: string): Promise<GetAddressResponseDto> {
    const body: GetAddressRequestDto = { token };
    return this.http.postJSON<GetAddressResponseDto, GetAddressRequestDto>(
      "/wallet/address",
      body,
    );
  }

  async getNftsByAddress(address: string): Promise<GetNftsResponseDto> {
    const path = `/nft/${encodeURIComponent(address)}`;
    return this.http.getJSON<GetNftsResponseDto>(path);
  }

  async health(): Promise<unknown> {
    return this.http.getJSON<unknown>("/");
  }
}
