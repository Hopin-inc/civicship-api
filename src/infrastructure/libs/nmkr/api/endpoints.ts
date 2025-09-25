import { AxiosInstance } from "axios";
import { NmkrHttp } from "./http";
import { components } from "../types/openapi";
import { Chain } from "../types/types.generated";
import type {
  CreatePaymentTransactionRequestBody,
  CreatePaymentTransactionResponse,
  CheckUtxoResponse,
  PayoutWalletsResponse,
  ServerStateResponse,
  PublicMintsResponse,
  GetProjectTransactionsResponse,
  GetAdditionalPayoutWalletsResponse,
  AllAssetsInWalletResponse,
  WalletUtxoResponse,
  UploadNftRequest,
  UploadNftResponse,
  UpdateMetadataResponse,
  GetNmkrPayStatusResponse,
  MintAndSendMultipleSpecificRequestBody,
  MintAndSendMultipleSpecificResponse,
  ProceedReserveRequestBody,
  ProceedReserveResponse,
  ProceedMintRequestBody,
  ProceedMintResponse,
  ProceedCancelResponse,
  ProjectDetailsResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  UploadToIpfsRequestBody,
  UploadToIpfsResponse,
  CheckAddressResponse,
  CancelAddressReservationResponse,
  WhitelistGetResponse,
  WhitelistPostResponse,
  WhitelistDeleteResponse,
  SaleConditionsGetResponse,
  SaleConditionsPutRequestBody,
  SaleConditionsPutResponse,
} from "../types/types.aliases";
import type { 
  CreateWalletResponse,
  CreateSubcustomerRequest,
  CreateSubcustomerResponse,
  CreateApikeyForSubcustomerRequest,
  CreateApikeyForSubcustomerResponse
} from "../types/types.generated";
import type {
  GetGetCountsApikeyProjectuid_3ababbResponse,
  GetGetNftDetailsByIdApikeyNftuid_1b8124Response,
  GetGetNftsApikeyProjectuidStateCountPage_db3058Response,
  GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse,
  GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response,
  GetListProjectsApikey_b6d5e7Response,
  GetListProjectsApikeyCountPage_1d70d9Response,
} from "../types/types.operations";

export class NmkrEndpoints {
  private readonly http2: NmkrHttp;
  private readonly countsPath: string;

  constructor(http: AxiosInstance) {
    this.http2 = new NmkrHttp(http);
    this.countsPath = process.env.NMKR_COUNTS_PATH ?? "/v2/GetCounts";
  }

  async createPaymentTransactionForSpecificNft(
    payload: CreatePaymentTransactionRequestBody,
  ): Promise<CreatePaymentTransactionResponse> {
    return this.http2.postJSON<
      CreatePaymentTransactionResponse,
      CreatePaymentTransactionRequestBody
    >("/v2/CreatePaymentTransaction", payload);
  }

  async createPaymentTransactionForRandomNft(
    payload: CreatePaymentTransactionRequestBody,
  ): Promise<CreatePaymentTransactionResponse> {
    return this.http2.postJSON<
      CreatePaymentTransactionResponse,
      CreatePaymentTransactionRequestBody
    >("/v2/CreatePaymentTransaction", payload);
  }

  async checkUtxo(address: string): Promise<CheckUtxoResponse> {
    return this.http2.getJSON<CheckUtxoResponse>(`/v2/CheckUtxo/${encodeURIComponent(address)}`);
  }

  async getPayoutWallets(): Promise<PayoutWalletsResponse> {
    return this.http2.getJSON<PayoutWalletsResponse>("/v2/GetPayoutWallets");
  }

  async getRates(): Promise<components["schemas"]["PricelistClass"]> {
    return this.http2.getJSON<components["schemas"]["PricelistClass"]>("/v2/GetRates");
  }

  async getAdaRates(): Promise<components["schemas"]["PricelistClass"]> {
    return this.http2.getJSON<components["schemas"]["PricelistClass"]>("/v2/GetAdaRates");
  }

  async getServerState(): Promise<ServerStateResponse> {
    return this.http2.getJSON<ServerStateResponse>("/v2/GetServerState");
  }

  async getPublicMints(): Promise<PublicMintsResponse> {
    return this.http2.getJSON<PublicMintsResponse>("/v2/GetPublicMints");
  }

  async getSolanaRates(): Promise<components["schemas"]["PricelistClass"]> {
    return this.http2.getJSON<components["schemas"]["PricelistClass"]>("/v2/GetSolanaRates");
  }

  async getCounts(projectUid: string): Promise<GetGetCountsApikeyProjectuid_3ababbResponse> {
    return this.http2.getJSON<GetGetCountsApikeyProjectuid_3ababbResponse>(
      `${this.countsPath}/${encodeURIComponent(projectUid)}`,
    );
  }

  async getProjectTransactions(projectUid: string): Promise<GetProjectTransactionsResponse> {
    return this.http2.getJSON<GetProjectTransactionsResponse>(
      `/v2/GetProjectTransactions/${encodeURIComponent(projectUid)}`,
    );
  }

  async getAdditionalPayoutWallets(
    projectUid: string,
  ): Promise<GetAdditionalPayoutWalletsResponse> {
    return this.http2.getJSON<GetAdditionalPayoutWalletsResponse>(
      `/v2/GetAdditionalPayoutWallets/${encodeURIComponent(projectUid)}`,
    );
  }

  async getNftDetailsById(
    nftUid: string,
  ): Promise<GetGetNftDetailsByIdApikeyNftuid_1b8124Response> {
    return this.http2.getJSON<GetGetNftDetailsByIdApikeyNftuid_1b8124Response>(
      `/v2/GetNftDetailsById/${encodeURIComponent(nftUid)}`,
    );
  }

  async getPaymentAddressForRandomNftSale(
    projectUid: string,
    countNft: number,
    customerIpAddress: string,
  ): Promise<components["schemas"]["GetPaymentAddressResultClass"]> {
    try {
      return await this.http2.getJSON<components["schemas"]["GetPaymentAddressResultClass"]>(
        `/v2/GetPaymentAddressForRandomNftSale/${encodeURIComponent(projectUid)}/${countNft}/${encodeURIComponent(customerIpAddress)}`,
      );
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "status" in error &&
        (error as { status: number }).status === 406
      ) {
        try {
          const saleConditions = await this.getSaleConditions(projectUid);
          console.warn("SaleConditions snapshot (406):", JSON.stringify(saleConditions, null, 2));
        } catch (scError) {
          console.warn("Failed to fetch SaleConditions for 406 debugging:", scError);
        }
      }
      throw error;
    }
  }

  /**
   * Retrieves all assets in a wallet. This is a heavy operation that can take up to 90 seconds.
   * For faster results with basic UTXO information, consider using getWalletUtxo() instead.
   *
   * @param address - The wallet address to query
   * @param options - Optional configuration including timeout (default: 90000ms)
   * @returns Promise resolving to all assets in the wallet
   * @throws Error if the request times out or fails
   */
  async getAllAssetsInWallet(
    address: string,
    options?: { timeoutMs?: number },
  ): Promise<AllAssetsInWalletResponse> {
    const timeout = options?.timeoutMs || 90000;
    try {
      return await this.http2.getJSON<AllAssetsInWalletResponse>(
        `/v2/GetAllAssetsInWallet/${encodeURIComponent(address)}`,
        { timeout },
      );
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message?.includes("timeout") || error.message?.includes("ECONNABORTED"))
      ) {
        console.warn(
          `GetAllAssetsInWallet timeout for ${address}. Consider using GetWalletUtxo as alternative.`,
        );
      }
      throw error;
    }
  }

  async getNfts(
    projectUid: string,
    state: string,
    count: number,
    page: number,
  ): Promise<GetGetNftsApikeyProjectuidStateCountPage_db3058Response> {
    return this.http2.getJSON<GetGetNftsApikeyProjectuidStateCountPage_db3058Response>(
      `/v2/GetNfts/${encodeURIComponent(projectUid)}/${state}/${count}/${page}`,
    );
  }

  async getWalletUtxo(address: string): Promise<WalletUtxoResponse> {
    return this.http2.getJSON<WalletUtxoResponse>(
      `/v2/GetWalletUtxo/${encodeURIComponent(address)}`,
    );
  }

  async uploadNft(projectUid: string, payload: UploadNftRequest): Promise<UploadNftResponse> {
    return this.http2.postJSON<UploadNftResponse, UploadNftRequest>(
      `/v2/UploadNft/${encodeURIComponent(projectUid)}?uploadsource=api`,
      payload,
    );
  }

  async getNmkrPayStatus(paymentTransactionUid: string): Promise<GetNmkrPayStatusResponse> {
    return this.http2.getJSON<GetNmkrPayStatusResponse>(
      `/v2/GetNmkrPayStatus/${encodeURIComponent(paymentTransactionUid)}`,
    );
  }

  async mintAndSendRandom(
    projectUid: string,
    countNft: number,
    receiverAddress: string,
    blockchain: Chain = "Cardano",
  ): Promise<GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse> {
    return this.http2.getJSON<GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse>(
      `/v2/MintAndSendRandom/${encodeURIComponent(projectUid)}/${countNft}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`,
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
      `/v2/MintAndSendSpecific/${encodeURIComponent(projectUid)}/${encodeURIComponent(nftUid)}/${tokenCount}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`,
    );
  }

  async mintAndSendMultipleSpecific(
    projectUid: string,
    receiverAddress: string,
    payload: MintAndSendMultipleSpecificRequestBody,
    blockchain: Chain = "Cardano",
  ): Promise<MintAndSendMultipleSpecificResponse> {
    return this.http2.postJSON<
      MintAndSendMultipleSpecificResponse,
      MintAndSendMultipleSpecificRequestBody
    >(
      `/v2/MintAndSendSpecific/${encodeURIComponent(projectUid)}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`,
      payload,
    );
  }

  async reservePaymentgatewayMintAndSendNft(
    paymentTransactionUid: string,
    payload: ProceedReserveRequestBody,
  ): Promise<ProceedReserveResponse> {
    return this.http2.postJSON<ProceedReserveResponse, ProceedReserveRequestBody>(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/ReservePaymentgatewayMintAndSendNft`,
      payload,
    );
  }

  async mintAndSendPaymentgatewayNft(
    paymentTransactionUid: string,
    payload: ProceedMintRequestBody,
  ): Promise<ProceedMintResponse> {
    return this.http2.postJSON<ProceedMintResponse, ProceedMintRequestBody>(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/MintAndSendPaymentgatewayNft`,
      payload,
    );
  }

  async cancelTransaction(paymentTransactionUid: string): Promise<ProceedCancelResponse> {
    return this.http2.postJSON<ProceedCancelResponse, Record<string, never>>(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/CancelTransaction`,
      {},
    );
  }

  async getProjectDetails(projectUid: string): Promise<ProjectDetailsResponse> {
    return this.http2.getJSON<ProjectDetailsResponse>(
      `/v2/GetProjectDetails/${encodeURIComponent(projectUid)}`,
    );
  }

  async createProject(payload: CreateProjectRequest): Promise<CreateProjectResponse> {
    return this.http2.postJSON<CreateProjectResponse, CreateProjectRequest>(
      "/v2/CreateProject",
      payload,
    );
  }

  async updateMetadata(
    projectUid: string,
    nftUid: string,
    payload: components["schemas"]["UploadMetadataClass"],
  ): Promise<UpdateMetadataResponse> {
    return this.http2.postJSON<
      UpdateMetadataResponse,
      components["schemas"]["UploadMetadataClass"]
    >(
      `/v2/UpdateMetadata/${encodeURIComponent(projectUid)}/${encodeURIComponent(nftUid)}`,
      payload,
    );
  }

  async getPaymentAddressForSpecificNftSale(
    nftUid: string,
    tokenCount: number,
    referer?: string,
    customProperty?: string,
    optionalReceiverAddress?: string,
  ): Promise<components["schemas"]["GetPaymentAddressResultClass"]> {
    let url = `/v2/GetPaymentAddressForSpecificNftSale/${encodeURIComponent(nftUid)}/${tokenCount}`;
    const params = new URLSearchParams();

    if (referer) params.append("referer", referer);
    if (customProperty) params.append("customproperty", customProperty);
    if (optionalReceiverAddress) params.append("optionalreceiveraddress", optionalReceiverAddress);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http2.getJSON<components["schemas"]["GetPaymentAddressResultClass"]>(url);
  }

  async uploadToIpfs(
    customerId: number,
    payload: UploadToIpfsRequestBody,
  ): Promise<UploadToIpfsResponse> {
    return this.http2.postJSON<UploadToIpfsResponse, UploadToIpfsRequestBody>(
      `/v2/UploadToIpfs/${customerId}`,
      payload,
    );
  }

  async checkAddress(projectUid: string, address: string): Promise<CheckAddressResponse> {
    return this.http2.getJSON<CheckAddressResponse>(
      `/v2/CheckAddress/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`,
    );
  }

  async cancelAddressReservation(
    projectUid: string,
    paymentAddress: string,
  ): Promise<CancelAddressReservationResponse> {
    const path = `/v2/CancelAddressReservation/${encodeURIComponent(projectUid)}/${encodeURIComponent(paymentAddress)}`;

    try {
      return await this.http2.deleteJSON<CancelAddressReservationResponse>(path);
    } catch (error) {
      return this.http2.getJSON<CancelAddressReservationResponse>(path);
    }
  }

  async getWhitelist(projectUid: string): Promise<WhitelistGetResponse> {
    return this.http2.getJSON<WhitelistGetResponse>(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}`,
    );
  }

  async addToWhitelist(
    projectUid: string,
    address: string,
    countOfNfts: number,
  ): Promise<WhitelistPostResponse> {
    return this.http2.postJSON<WhitelistPostResponse, Record<string, never>>(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}/${countOfNfts}`,
      {},
    );
  }

  async removeFromWhitelist(projectUid: string, address: string): Promise<WhitelistDeleteResponse> {
    return this.http2.deleteJSON<WhitelistDeleteResponse>(
      `/v2/ManageWhitelist/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`,
    );
  }

  async listProjects(): Promise<GetListProjectsApikey_b6d5e7Response> {
    return this.http2.getJSON<GetListProjectsApikey_b6d5e7Response>("/v2/ListProjects");
  }

  async listProjectsPaginated(
    count: number,
    page: number,
  ): Promise<GetListProjectsApikeyCountPage_1d70d9Response> {
    return this.http2.getJSON<GetListProjectsApikeyCountPage_1d70d9Response>(
      `/v2/ListProjects/${count}/${page}`,
    );
  }

  async getSaleConditions(projectUid: string): Promise<SaleConditionsGetResponse> {
    return this.http2.getJSON<SaleConditionsGetResponse>(
      `/v2/GetSaleConditions/${encodeURIComponent(projectUid)}`,
    );
  }

  async updateSaleConditions(
    projectUid: string,
    payload: SaleConditionsPutRequestBody,
  ): Promise<SaleConditionsPutResponse> {
    return this.http2.putJSON<SaleConditionsPutResponse, SaleConditionsPutRequestBody>(
      `/v2/UpdateSaleConditions/${encodeURIComponent(projectUid)}`,
      payload,
    );
  }

  async createWallet(customerId: number): Promise<CreateWalletResponse> {
    return this.http2.postJSON<CreateWalletResponse, Record<string, never>>(
      `/v2/CreateWallet/${customerId}`,
      {},
    );
  }

  async createSubcustomer(
    customerId: number,
    payload: CreateSubcustomerRequest,
  ): Promise<CreateSubcustomerResponse> {
    return this.http2.postJSON<CreateSubcustomerResponse, CreateSubcustomerRequest>(
      `/v2/CreateSubcustomer/${customerId}`,
      payload,
    );
  }

  async createApikeyForSubcustomer(
    customerId: number,
    payload: CreateApikeyForSubcustomerRequest,
  ): Promise<CreateApikeyForSubcustomerResponse> {
    return this.http2.postJSON<CreateApikeyForSubcustomerResponse, CreateApikeyForSubcustomerRequest>(
      `/v2/CreateApikeyForSubcustomer/${customerId}`,
      payload,
    );
  }
}
