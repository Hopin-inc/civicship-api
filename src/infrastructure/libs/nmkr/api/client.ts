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

  async createRandomNftSale(
    payload: Arg<NmkrEndpoints["createPaymentTransactionForRandomNft"]>,
  ): Promise<Res<NmkrEndpoints["createPaymentTransactionForRandomNft"]>> {
    return this.handleRequest(
      () => this.endpoints.createPaymentTransactionForRandomNft(payload),
      "Failed to create random NFT sale",
    );
  }

  async checkUtxo(
    address: Arg<NmkrEndpoints["checkUtxo"]>,
  ): Promise<Res<NmkrEndpoints["checkUtxo"]>> {
    return this.handleRequest(() => this.endpoints.checkUtxo(address), "Failed to check UTXO");
  }

  async getRates(): Promise<components["schemas"]["PricelistClass"]> {
    return this.handleRequest(() => this.endpoints.getRates(), "Failed to get rates");
  }

  async getAdaRates(): Promise<components["schemas"]["PricelistClass"]> {
    return this.handleRequest(() => this.endpoints.getAdaRates(), "Failed to get ADA rates");
  }

  async getServerState(): Promise<Res<NmkrEndpoints["getServerState"]>> {
    return this.handleRequest(() => this.endpoints.getServerState(), "Failed to get server state");
  }

  async getPublicMints(): Promise<Res<NmkrEndpoints["getPublicMints"]>> {
    return this.handleRequest(() => this.endpoints.getPublicMints(), "Failed to get public mints");
  }

  async getCounts(
    projectUid: Arg<NmkrEndpoints["getCounts"]>,
  ): Promise<Res<NmkrEndpoints["getCounts"]>> {
    return this.handleRequest(() => this.endpoints.getCounts(projectUid), "Failed to get counts");
  }

  async getProjectTransactions(
    projectUid: Arg<NmkrEndpoints["getProjectTransactions"]>,
  ): Promise<Res<NmkrEndpoints["getProjectTransactions"]>> {
    return this.handleRequest(
      () => this.endpoints.getProjectTransactions(projectUid),
      "Failed to get project transactions",
    );
  }

  async getAdditionalPayoutWallets(
    projectUid: Arg<NmkrEndpoints["getAdditionalPayoutWallets"]>,
  ): Promise<Res<NmkrEndpoints["getAdditionalPayoutWallets"]>> {
    return this.handleRequest(
      () => this.endpoints.getAdditionalPayoutWallets(projectUid),
      "Failed to get additional payout wallets",
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

  async getPaymentAddressForRandomNftSale(
    projectUid: string,
    countNft: number,
    customerIpAddress: string,
  ): Promise<components["schemas"]["GetPaymentAddressResultClass"]> {
    return this.handleRequest(
      () =>
        this.endpoints.getPaymentAddressForRandomNftSale(projectUid, countNft, customerIpAddress),
      "Failed to get payment address for random NFT sale",
    );
  }

  async getAllAssetsInWallet(
    address: string,
    options?: { timeoutMs?: number },
  ): Promise<Res<NmkrEndpoints["getAllAssetsInWallet"]>> {
    return this.handleRequest(
      () => this.endpoints.getAllAssetsInWallet(address, options),
      "Failed to get all assets in wallet",
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

  async getNmkrPayStatus(
    paymentTransactionUid: Arg<NmkrEndpoints["getNmkrPayStatus"]>,
  ): Promise<Res<NmkrEndpoints["getNmkrPayStatus"]>> {
    return this.handleRequest(
      () => this.endpoints.getNmkrPayStatus(paymentTransactionUid),
      "Failed to get NMKR pay status",
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

  async reservePaymentgatewayMintAndSendNft(
    paymentTransactionUid: string,
    payload: Arg<NmkrEndpoints["reservePaymentgatewayMintAndSendNft"], 1>,
  ): Promise<Res<NmkrEndpoints["reservePaymentgatewayMintAndSendNft"]>> {
    return this.handleRequest(
      () => this.endpoints.reservePaymentgatewayMintAndSendNft(paymentTransactionUid, payload),
      "Failed to reserve paymentgateway mint and send NFT",
    );
  }

  async mintAndSendPaymentgatewayNft(
    paymentTransactionUid: string,
    payload: Arg<NmkrEndpoints["mintAndSendPaymentgatewayNft"], 1>,
  ): Promise<Res<NmkrEndpoints["mintAndSendPaymentgatewayNft"]>> {
    return this.handleRequest(
      () => this.endpoints.mintAndSendPaymentgatewayNft(paymentTransactionUid, payload),
      "Failed to mint and send paymentgateway NFT",
    );
  }

  async cancelTransaction(
    paymentTransactionUid: Arg<NmkrEndpoints["cancelTransaction"]>,
  ): Promise<Res<NmkrEndpoints["cancelTransaction"]>> {
    return this.handleRequest(
      () => this.endpoints.cancelTransaction(paymentTransactionUid),
      "Failed to cancel transaction",
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

  async getPaymentAddressForSpecificNftSale(
    nftUid: string,
    tokenCount: number,
    referer?: string,
    customProperty?: string,
    optionalReceiverAddress?: string,
  ): Promise<components["schemas"]["GetPaymentAddressResultClass"]> {
    return this.handleRequest(
      () =>
        this.endpoints.getPaymentAddressForSpecificNftSale(
          nftUid,
          tokenCount,
          referer,
          customProperty,
          optionalReceiverAddress,
        ),
      "Failed to get payment address for specific NFT sale",
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

  async getWhitelist(
    projectUid: Arg<NmkrEndpoints["getWhitelist"]>,
  ): Promise<Res<NmkrEndpoints["getWhitelist"]>> {
    return this.handleRequest(
      () => this.endpoints.getWhitelist(projectUid),
      "Failed to get whitelist",
    );
  }

  async listProjects(): Promise<Res<NmkrEndpoints["listProjects"]>> {
    return this.handleRequest(() => this.endpoints.listProjects(), "Failed to list projects");
  }

  async listProjectsPaginated(
    count: number,
    page: number,
  ): Promise<Res<NmkrEndpoints["listProjectsPaginated"]>> {
    return this.handleRequest(
      () => this.endpoints.listProjectsPaginated(count, page),
      "Failed to list projects with pagination",
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
