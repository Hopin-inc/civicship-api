import { AxiosInstance } from "axios";
import { NmkrHttp } from "./http";
import { components } from "./openapi";
import { Chain } from "./types.generated";
import type {
  GetGetCountsApikeyProjectuid_3ababbResponse,
  GetGetNftDetailsByIdApikeyNftuid_1b8124Response,
  GetGetNftsApikeyProjectuidStateCountPage_db3058Response,
  GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse,
  GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response,
  GetListProjectsApikey_b6d5e7Response,
  GetListProjectsApikeyCountPage_1d70d9Response
} from "./types.operations";

export class NmkrEndpoints {
  private readonly http2: NmkrHttp;
  private readonly countsPath: string;

  constructor(http: AxiosInstance) {
    this.http2 = new NmkrHttp(http);
    this.countsPath = process.env.NMKR_COUNTS_PATH ?? '/v2/GetCounts';
  }

  async createPaymentTransactionForSpecificNft(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, Record<string, unknown>>(
      "/v2/CreatePaymentTransaction",
      payload
    );
  }

  async createPaymentTransactionForRandomNft(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, Record<string, unknown>>(
      "/v2/CreatePaymentTransaction",
      payload
    );
  }

  async checkUtxo(address: string): Promise<Record<string, unknown>> {
    return this.http2.getJSON<Record<string, unknown>>(`/v2/CheckUtxo/${encodeURIComponent(address)}`);
  }

  async getPayoutWallets(): Promise<Record<string, unknown>[]> {
    return this.http2.getJSON<Record<string, unknown>[]>("/v2/GetPayoutWallets");
  }

  async getRates(): Promise<components['schemas']['PricelistClass']> {
    return this.http2.getJSON<components['schemas']['PricelistClass']>("/v2/GetRates");
  }

  async getAdaRates(): Promise<components['schemas']['PricelistClass']> {
    return this.http2.getJSON<components['schemas']['PricelistClass']>("/v2/GetAdaRates");
  }

  async getServerState(): Promise<Record<string, unknown>[]> {
    return this.http2.getJSON<Record<string, unknown>[]>("/v2/GetServerState");
  }

  async getPublicMints(): Promise<Record<string, unknown>[]> {
    return this.http2.getJSON<Record<string, unknown>[]>("/v2/GetPublicMints");
  }

  async getSolanaRates(): Promise<components['schemas']['PricelistClass']> {
    return this.http2.getJSON<components['schemas']['PricelistClass']>("/v2/GetSolanaRates");
  }

  async getCounts(projectUid: string): Promise<GetGetCountsApikeyProjectuid_3ababbResponse> {
    return this.http2.getJSON<GetGetCountsApikeyProjectuid_3ababbResponse>(
      `${this.countsPath}/${encodeURIComponent(projectUid)}`
    );
  }

  async getProjectTransactions(projectUid: string): Promise<Record<string, unknown>[]> {
    return this.http2.getJSON<Record<string, unknown>[]>(
      `/v2/GetProjectTransactions/${encodeURIComponent(projectUid)}`
    );
  }

  async getAdditionalPayoutWallets(projectUid: string): Promise<Record<string, unknown>[]> {
    return this.http2.getJSON<Record<string, unknown>[]>(
      `/v2/GetAdditionalPayoutWallets/${encodeURIComponent(projectUid)}`
    );
  }

  async getNftDetailsById(nftUid: string): Promise<GetGetNftDetailsByIdApikeyNftuid_1b8124Response> {
    return this.http2.getJSON<GetGetNftDetailsByIdApikeyNftuid_1b8124Response>(
      `/v2/GetNftDetailsById/${encodeURIComponent(nftUid)}`
    );
  }

  async getPaymentAddressForRandomNftSale(
    projectUid: string,
    countNft: number,
    customerIpAddress: string,
  ): Promise<components['schemas']['GetPaymentAddressResultClass']> {
    try {
      return await this.http2.getJSON<components['schemas']['GetPaymentAddressResultClass']>(
        `/v2/GetPaymentAddressForRandomNftSale/${encodeURIComponent(projectUid)}/${countNft}/${encodeURIComponent(customerIpAddress)}`
      );
    } catch (error: unknown) {
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 406) {
        try {
          const saleConditions = await this.getSaleConditions(projectUid);
          console.warn('SaleConditions snapshot (406):', JSON.stringify(saleConditions, null, 2));
        } catch (scError) {
          console.warn('Failed to fetch SaleConditions for 406 debugging:', scError);
        }
      }
      throw error;
    }
  }

  async getAllAssetsInWallet(address: string, options?: { timeoutMs?: number }): Promise<Record<string, unknown>[]> {
    const timeout = options?.timeoutMs || 90000;
    try {
      return await this.http2.getJSON<Record<string, unknown>[]>(
        `/v2/GetAllAssetsInWallet/${encodeURIComponent(address)}`,
        { timeout }
      );
    } catch (error: unknown) {
      if (error instanceof Error && (error.message?.includes('timeout') || error.message?.includes('ECONNABORTED'))) {
        console.warn(`GetAllAssetsInWallet timeout for ${address}. Consider using GetWalletUtxo as alternative.`);
      }
      throw error;
    }
  }

  async getNfts(projectUid: string, state: string, count: number, page: number): Promise<GetGetNftsApikeyProjectuidStateCountPage_db3058Response> {
    return this.http2.getJSON<GetGetNftsApikeyProjectuidStateCountPage_db3058Response>(
      `/v2/GetNfts/${encodeURIComponent(projectUid)}/${state}/${count}/${page}`
    );
  }

  async getWalletUtxo(address: string): Promise<Record<string, unknown>[]> {
    return this.http2.getJSON<Record<string, unknown>[]>(`/v2/GetWalletUtxo/${encodeURIComponent(address)}`);
  }

  async uploadNft(projectUid: string, payload: components['schemas']['UploadNftClass']): Promise<components['schemas']['UploadNftResultClass']> {
    return this.http2.postJSON<components['schemas']['UploadNftResultClass'], components['schemas']['UploadNftClass']>(
      `/v2/UploadNft/${encodeURIComponent(projectUid)}?uploadsource=api`,
      payload
    );
  }

  async getNmkrPayStatus(paymentTransactionUid: string): Promise<Record<string, unknown>> {
    return this.http2.getJSON<Record<string, unknown>>(
      `/v2/GetNmkrPayStatus/${encodeURIComponent(paymentTransactionUid)}`
    );
  }

  async mintAndSendRandom(
    projectUid: string,
    countNft: number,
    receiverAddress: string,
    blockchain: Chain = "Cardano",
  ): Promise<GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse> {
    return this.http2.getJSON<GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse>(
      `/v2/MintAndSendRandom/${encodeURIComponent(projectUid)}/${countNft}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`
    );
  }

  async mintAndSendSpecific(
    projectUid: string,
    nftUid: string,
    tokenCount: number,
    receiverAddress: string,
    blockchain: Chain = "Cardano",
  ): Promise<GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response> {
    return this.http2.getJSON<GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response>(
      `/v2/MintAndSendSpecific/${encodeURIComponent(projectUid)}/${encodeURIComponent(nftUid)}/${tokenCount}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`
    );
  }

  async mintAndSendMultipleSpecific(
    projectUid: string,
    receiverAddress: string,
    payload: Record<string, unknown>,
    blockchain: Chain = "Cardano",
  ): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, Record<string, unknown>>(
      `/v2/MintAndSendSpecific/${encodeURIComponent(projectUid)}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`,
      payload
    );
  }

  async reservePaymentgatewayMintAndSendNft(
    paymentTransactionUid: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, Record<string, unknown>>(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/ReservePaymentgatewayMintAndSendNft`,
      payload
    );
  }

  async mintAndSendPaymentgatewayNft(
    paymentTransactionUid: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, Record<string, unknown>>(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/MintAndSendPaymentgatewayNft`,
      payload
    );
  }

  async cancelTransaction(paymentTransactionUid: string): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, Record<string, never>>(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/CancelTransaction`,
      {}
    );
  }

  async getProjectDetails(projectUid: string): Promise<components['schemas']['NftProjectsDetails']> {
    return this.http2.getJSON<components['schemas']['NftProjectsDetails']>(
      `/v2/GetProjectDetails/${encodeURIComponent(projectUid)}`
    );
  }

  async createProject(payload: components['schemas']['CreateProjectClass']): Promise<components['schemas']['CreateNewProjectResultClass']> {
    return this.http2.postJSON<components['schemas']['CreateNewProjectResultClass'], components['schemas']['CreateProjectClass']>(
      "/v2/CreateProject",
      payload
    );
  }

  async updateMetadata(
    projectUid: string,
    nftUid: string,
    payload: components['schemas']['UploadMetadataClass'],
  ): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, components['schemas']['UploadMetadataClass']>(
      `/v2/UpdateMetadata/${encodeURIComponent(projectUid)}/${encodeURIComponent(nftUid)}`,
      payload
    );
  }

  async getPaymentAddressForSpecificNftSale(
    nftUid: string,
    tokenCount: number,
    referer?: string,
    customProperty?: string,
    optionalReceiverAddress?: string,
  ): Promise<components['schemas']['GetPaymentAddressResultClass']> {
    let url = `/v2/GetPaymentAddressForSpecificNftSale/${encodeURIComponent(nftUid)}/${tokenCount}`;
    const params = new URLSearchParams();

    if (referer) params.append("referer", referer);
    if (customProperty) params.append("customproperty", customProperty);
    if (optionalReceiverAddress) params.append("optionalreceiveraddress", optionalReceiverAddress);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http2.getJSON<components['schemas']['GetPaymentAddressResultClass']>(url);
  }

  async uploadToIpfs(customerId: number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, Record<string, unknown>>(
      `/v2/UploadToIpfs/${customerId}`,
      payload
    );
  }

  async checkAddress(projectUid: string, address: string): Promise<components['schemas']['CheckAddressResultClass']> {
    return this.http2.getJSON<components['schemas']['CheckAddressResultClass']>(
      `/v2/CheckAddress/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`
    );
  }

  async cancelAddressReservation(projectUid: string, paymentAddress: string): Promise<Record<string, unknown>> {
    const path = `/v2/CancelAddressReservation/${encodeURIComponent(projectUid)}/${encodeURIComponent(paymentAddress)}`;
    
    try {
      return await this.http2.deleteJSON<Record<string, unknown>>(path);
    } catch (error) {
      return this.http2.getJSON<Record<string, unknown>>(path);
    }
  }

  async getWhitelist(projectUid: string): Promise<Record<string, unknown>[]> {
    return this.http2.getJSON<Record<string, unknown>[]>(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}`
    );
  }

  async addToWhitelist(projectUid: string, address: string, countOfNfts: number): Promise<Record<string, unknown>> {
    return this.http2.postJSON<Record<string, unknown>, Record<string, never>>(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}/${countOfNfts}`,
      {}
    );
  }

  async removeFromWhitelist(projectUid: string, address: string): Promise<Record<string, unknown>> {
    return this.http2.deleteJSON<Record<string, unknown>>(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`
    );
  }

  async listProjects(): Promise<GetListProjectsApikey_b6d5e7Response> {
    return this.http2.getJSON<GetListProjectsApikey_b6d5e7Response>("/v2/ListProjects");
  }

  async listProjectsPaginated(count: number, page: number): Promise<GetListProjectsApikeyCountPage_1d70d9Response> {
    return this.http2.getJSON<GetListProjectsApikeyCountPage_1d70d9Response>(
      `/v2/ListProjects/${count}/${page}`
    );
  }

  async getSaleConditions(projectUid: string): Promise<Record<string, unknown>> {
    return this.http2.getJSON<Record<string, unknown>>(
      `/v2/GetSaleConditions/${encodeURIComponent(projectUid)}`
    );
  }

  async updateSaleConditions(projectUid: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.http2.putJSON<Record<string, unknown>, Record<string, unknown>>(
      `/v2/UpdateSaleConditions/${encodeURIComponent(projectUid)}`,
      payload
    );
  }
}
