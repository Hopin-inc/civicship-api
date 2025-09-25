import { AxiosInstance } from "axios";
import { NmkrHttp } from "./http";
import { components } from "../types/openapi";
import { Chain } from "../types/types.generated";
import type {
  CreatePaymentTransactionRequestBody,
  CreatePaymentTransactionResponse,
  CheckUtxoResponse,
  GetProjectTransactionsResponse,
  WalletUtxoResponse,
  UploadNftRequest,
  UploadNftResponse,
  UpdateMetadataResponse,
  GetNmkrPayStatusResponse,
  ProjectDetailsResponse,
  CheckAddressResponse,
  SaleConditionsGetResponse,
} from "../types/types.aliases";
import type { CreateWalletResponse } from "../types/types.generated";
import type {
  GetGetNftDetailsByIdApikeyNftuid_1b8124Response,
  GetGetNftsApikeyProjectuidStateCountPage_db3058Response,
  GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse,
  GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response,
} from "../types/types.operations";

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

  async checkUtxo(address: string): Promise<CheckUtxoResponse> {
    return this.http2.getJSON<CheckUtxoResponse>(`/v2/CheckUtxo/${encodeURIComponent(address)}`);
  }

  async getProjectTransactions(projectUid: string): Promise<GetProjectTransactionsResponse> {
    return this.http2.getJSON<GetProjectTransactionsResponse>(
      `/v2/GetProjectTransactions/${encodeURIComponent(projectUid)}`,
    );
  }

  async getNftDetailsById(
    nftUid: string,
  ): Promise<GetGetNftDetailsByIdApikeyNftuid_1b8124Response> {
    return this.http2.getJSON<GetGetNftDetailsByIdApikeyNftuid_1b8124Response>(
      `/v2/GetNftDetailsById/${encodeURIComponent(nftUid)}`,
    );
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

  async getProjectDetails(projectUid: string): Promise<ProjectDetailsResponse> {
    return this.http2.getJSON<ProjectDetailsResponse>(
      `/v2/GetProjectDetails/${encodeURIComponent(projectUid)}`,
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

  async checkAddress(projectUid: string, address: string): Promise<CheckAddressResponse> {
    return this.http2.getJSON<CheckAddressResponse>(
      `/v2/CheckAddress/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`,
    );
  }

  async getSaleConditions(projectUid: string): Promise<SaleConditionsGetResponse> {
    return this.http2.getJSON<SaleConditionsGetResponse>(
      `/v2/GetSaleConditions/${encodeURIComponent(projectUid)}`,
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
}
