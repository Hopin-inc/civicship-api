import { AxiosInstance } from "axios";
import { NmkrHttp } from "./http";
import { components } from "./openapi";
import { Chain, MintResult } from "./types.generated";
import type {
  GetGetCountsApikeyProjectuid_3ababbResponse,
  GetGetNftDetailsByIdApikeyNftuid_1b8124Response,
  GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse,
  GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response
} from "./types.operations";

export class NmkrEndpoints {
  private readonly http2: NmkrHttp;
  private readonly countsPath: string;

  constructor(private readonly http: AxiosInstance) {
    this.http2 = new NmkrHttp(http);
    this.countsPath = process.env.NMKR_COUNTS_PATH ?? '/v2/GetCounts';
  }

  private createRequestConfig(includeContentType = false) {
    const config: any = {
      responseType: "text" as any,
    };

    if (includeContentType) {
      config.headers = { 
        ...(config.headers ?? {}), 
        'Content-Type': 'application/json' 
      };
    }

    return config;
  }

  async createPaymentTransactionForSpecificNft(
    payload: any,
  ): Promise<any> {
    const { data } = await this.http.post(
      "/v2/CreatePaymentTransaction",
      payload,
      this.createRequestConfig(true),
    );
    return data;
  }

  async createPaymentTransactionForRandomNft(
    payload: any,
  ): Promise<any> {
    const { data } = await this.http.post(
      "/v2/CreatePaymentTransaction",
      payload,
      this.createRequestConfig(true),
    );
    return data;
  }

  async checkUtxo(address: string): Promise<any> {
    return this.http2.getJSON(`/v2/CheckUtxo/${encodeURIComponent(address)}`);
  }

  async getPayoutWallets(): Promise<any> {
    return this.http2.getJSON("/v2/GetPayoutWallets");
  }

  async getRates(): Promise<components['schemas']['PricelistClass']> {
    return this.http2.getJSON<components['schemas']['PricelistClass']>("/v2/GetRates");
  }

  async getAdaRates(): Promise<components['schemas']['PricelistClass']> {
    return this.http2.getJSON<components['schemas']['PricelistClass']>("/v2/GetAdaRates");
  }

  async getServerState(): Promise<any> {
    return this.http2.getJSON("/v2/GetServerState");
  }

  async getPublicMints(): Promise<any> {
    return this.http2.getJSON("/v2/GetPublicMints");
  }

  async getSolanaRates(): Promise<components['schemas']['PricelistClass']> {
    return this.http2.getJSON<components['schemas']['PricelistClass']>("/v2/GetSolanaRates");
  }

  async getCounts(projectUid: string): Promise<GetGetCountsApikeyProjectuid_3ababbResponse> {
    return this.http2.getJSON<GetGetCountsApikeyProjectuid_3ababbResponse>(
      `${this.countsPath}/${encodeURIComponent(projectUid)}`
    );
  }

  async getProjectTransactions(projectUid: string): Promise<any> {
    return this.http2.getJSON(
      `/v2/GetProjectTransactions/${encodeURIComponent(projectUid)}`
    );
  }

  async getAdditionalPayoutWallets(projectUid: string): Promise<any> {
    return this.http2.getJSON(
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
    return this.http2.getJSON<components['schemas']['GetPaymentAddressResultClass']>(
      `/v2/GetPaymentAddressForRandomNftSale/${encodeURIComponent(projectUid)}/${countNft}/${encodeURIComponent(customerIpAddress)}`
    );
  }

  async getAllAssetsInWallet(address: string): Promise<any> {
    return this.http2.getJSON(
      `/v2/GetAllAssetsInWallet/${encodeURIComponent(address)}`
    );
  }

  async getNfts(projectUid: string, state: string, count: number, page: number): Promise<components['schemas']['NftDetailsClass'][]> {
    return this.http2.getJSON<components['schemas']['NftDetailsClass'][]>(
      `/v2/GetNfts/${encodeURIComponent(projectUid)}/${state}/${count}/${page}`
    );
  }

  async getWalletUtxo(address: string): Promise<any> {
    return this.http2.getJSON(`/v2/GetWalletUtxo/${encodeURIComponent(address)}`);
  }

  async uploadNft(projectUid: string, payload: any): Promise<components['schemas']['UploadNftResultClass']> {
    return this.http2.postJSON(
      `/v2/UploadNft/${encodeURIComponent(projectUid)}?uploadsource=api`,
      payload,
      { headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain' } }
    );
  }

  async getNmkrPayStatus(paymentTransactionUid: string): Promise<any> {
    return this.http2.getJSON(
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
    payload: any,
    blockchain: Chain = "Cardano",
  ): Promise<MintResult> {
    return this.http2.postJSON<MintResult>(
      `/v2/MintAndSendSpecific/${encodeURIComponent(projectUid)}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async reservePaymentgatewayMintAndSendNft(
    paymentTransactionUid: string,
    payload: { receiverAddress: string },
  ): Promise<any> {
    return this.http2.postJSON(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/ReservePaymentgatewayMintAndSendNft`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async mintAndSendPaymentgatewayNft(
    paymentTransactionUid: string,
    payload: { receiverAddress: string },
  ): Promise<any> {
    return this.http2.postJSON(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/MintAndSendPaymentgatewayNft`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async cancelTransaction(paymentTransactionUid: string): Promise<any> {
    return this.http2.postJSON(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/CancelTransaction`,
      {}
    );
  }

  async getProjectDetails(projectUid: string): Promise<components['schemas']['NftProjectsDetails']> {
    return this.http2.getJSON<components['schemas']['NftProjectsDetails']>(
      `/v2/GetProjectDetails/${encodeURIComponent(projectUid)}`
    );
  }

  async createProject(payload: any): Promise<components['schemas']['CreateNewProjectResultClass']> {
    return this.http2.postJSON<components['schemas']['CreateNewProjectResultClass']>(
      "/v2/CreateProject",
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async updateMetadata(
    projectUid: string,
    nftUid: string,
    payload: any,
  ): Promise<any> {
    return this.http2.postJSON(
      `/v2/UpdateMetadata/${encodeURIComponent(projectUid)}/${encodeURIComponent(nftUid)}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
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

  async uploadToIpfs(customerId: number, payload: any): Promise<any> {
    return this.http2.postJSON(
      `/v2/UploadToIpfs/${customerId}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async checkAddress(projectUid: string, address: string): Promise<components['schemas']['CheckAddressResultClass']> {
    return this.http2.getJSON<components['schemas']['CheckAddressResultClass']>(
      `/v2/CheckAddress/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`
    );
  }

  async cancelAddressReservation(projectUid: string, paymentAddress: string): Promise<any> {
    const path = `/v2/CancelAddressReservation/${encodeURIComponent(projectUid)}/${encodeURIComponent(paymentAddress)}`;
    
    try {
      return await this.http2.deleteJSON(path);
    } catch (error) {
      return this.http2.getJSON(path);
    }
  }

  async getWhitelist(projectUid: string): Promise<any[]> {
    return this.http2.getJSON(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}`
    );
  }

  async addToWhitelist(projectUid: string, address: string, countOfNfts: number): Promise<any> {
    return this.http2.postJSON(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}/${countOfNfts}`,
      {}
    );
  }

  async removeFromWhitelist(projectUid: string, address: string): Promise<void> {
    return this.http2.deleteJSON<void>(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`
    );
  }

  async listProjects(): Promise<any[]> {
    return this.http2.getJSON("/v2/ListProjects");
  }

  async listProjectsPaginated(count: number, page: number): Promise<any[]> {
    return this.http2.getJSON(
      `/v2/ListProjects/${count}/${page}`
    );
  }

  async getSaleConditions(projectUid: string): Promise<any> {
    return this.http2.getJSON(
      `/v2/GetSaleConditions/${encodeURIComponent(projectUid)}`
    );
  }

  async updateSaleConditions(projectUid: string, payload: any): Promise<any> {
    return this.http2.putJSON(
      `/v2/UpdateSaleConditions/${encodeURIComponent(projectUid)}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
