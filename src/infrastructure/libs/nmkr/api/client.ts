import { injectable } from "tsyringe";
import { createNmkrHttpClient, NmkrApiError } from "./http";
import { NmkrEndpoints } from "./endpoints";
import { components } from "../types/openapi";
import { Chain } from "../types/types.generated";

type Arg<T extends (...a: any) => any, I extends number = 0> = Parameters<T>[I];
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

  async createSpecificNftSale(
    payload: Arg<NmkrEndpoints["createPaymentTransactionForSpecificNft"]>,
  ): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.createPaymentTransactionForSpecificNft(payload),
      "Failed to create specific NFT sale",
    );
  }

  async checkUtxo(
    address: Arg<NmkrEndpoints["checkUtxo"]>,
  ): Promise<Res<NmkrEndpoints["checkUtxo"]>> {
    return this.handleRequest(() => this.endpoints.checkUtxo(address), "Failed to check UTXO");
  }

  async getProjectTransactions(
    projectUid: Arg<NmkrEndpoints["getProjectTransactions"]>,
  ): Promise<Res<NmkrEndpoints["getProjectTransactions"]>> {
    return this.handleRequest(
      () => this.endpoints.getProjectTransactions(projectUid),
      "Failed to get project transactions",
    );
  }

  async getNftDetailsById(
    nftUid: Arg<NmkrEndpoints["getNftDetailsById"]>,
  ): Promise<Res<NmkrEndpoints["getNftDetailsById"]>> {
    return this.handleRequest(
      () => this.endpoints.getNftDetailsById(nftUid),
      "Failed to get NFT details by ID",
    );
  }

  async getNfts(
    projectUid: string,
    state: string,
    count: number,
    page: number,
  ): Promise<Res<NmkrEndpoints["getNfts"]>> {
    return this.handleRequest(
      () => this.endpoints.getNfts(projectUid, state, count, page),
      "Failed to get NFTs",
    );
  }

  async getWalletUtxo(
    address: Arg<NmkrEndpoints["getWalletUtxo"]>,
  ): Promise<Res<NmkrEndpoints["getWalletUtxo"]>> {
    return this.handleRequest(
      () => this.endpoints.getWalletUtxo(address),
      "Failed to get wallet UTXO",
    );
  }

  async uploadNft(
    projectUid: string,
    payload: components["schemas"]["UploadNftClass"],
  ): Promise<Res<NmkrEndpoints["uploadNft"]>> {
    return this.handleRequest(
      () => this.endpoints.uploadNft(projectUid, payload),
      "Failed to upload NFT",
    );
  }

  async mintAndSendRandom(
    projectUid: string,
    countNft: number,
    receiverAddress: string,
    blockchain: Chain = "Cardano",
  ): Promise<Res<NmkrEndpoints["mintAndSendRandom"]>> {
    return this.handleRequest(
      () => this.endpoints.mintAndSendRandom(projectUid, countNft, receiverAddress, blockchain),
      "Failed to mint and send random NFT",
    );
  }

  async mintAndSendSpecific(
    projectUid: string,
    nftUid: string,
    tokenCount: number,
    receiverAddress: string,
    blockchain: Chain = "Cardano",
  ): Promise<Res<NmkrEndpoints["mintAndSendSpecific"]>> {
    return this.handleRequest(
      () =>
        this.endpoints.mintAndSendSpecific(
          projectUid,
          nftUid,
          tokenCount,
          receiverAddress,
          blockchain,
        ),
      "Failed to mint and send specific NFT",
    );
  }

  async getProjectDetails(
    projectUid: Arg<NmkrEndpoints["getProjectDetails"]>,
  ): Promise<Res<NmkrEndpoints["getProjectDetails"]>> {
    return this.handleRequest(
      () => this.endpoints.getProjectDetails(projectUid),
      "Failed to get project details",
    );
  }

  async updateMetadata(
    projectUid: string,
    nftUid: string,
    payload: Arg<NmkrEndpoints["updateMetadata"], 2>,
  ): Promise<Res<NmkrEndpoints["updateMetadata"]>> {
    return this.handleRequest(
      () => this.endpoints.updateMetadata(projectUid, nftUid, payload),
      "Failed to update metadata",
    );
  }

  async checkAddress(
    projectUid: string,
    address: string,
  ): Promise<components["schemas"]["CheckAddressResultClass"]> {
    return this.handleRequest(
      () => this.endpoints.checkAddress(projectUid, address),
      "Failed to check address",
    );
  }

  async getSaleConditions(
    projectUid: Arg<NmkrEndpoints["getSaleConditions"]>,
  ): Promise<Res<NmkrEndpoints["getSaleConditions"]>> {
    return this.handleRequest(
      () => this.endpoints.getSaleConditions(projectUid),
      "Failed to get sale conditions",
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
