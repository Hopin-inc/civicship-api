import { injectable } from "tsyringe";
import { createNmkrHttpClient, NmkrHttpError } from "./http";
import { NmkrEndpoints } from "./endpoints";
import { components } from "./openapi";
import { Chain, MintResult } from "./types.generated";
import type {
  GetGetCountsApikeyProjectuid_3ababbResponse,
  GetGetNftDetailsByIdApikeyNftuid_1b8124Response,
  GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse,
  GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response
} from "./types.operations";

@injectable()
export class NmkrClient {
  private readonly endpoints: NmkrEndpoints;

  constructor() {
    const httpClient = createNmkrHttpClient();
    this.endpoints = new NmkrEndpoints(httpClient);
  }

  private async handleRequest<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createSpecificNftSale(
    payload: any,
  ): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.createPaymentTransactionForSpecificNft(payload),
      'Failed to create specific NFT sale'
    );
  }

  async createRandomNftSale(
    payload: any,
  ): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.createPaymentTransactionForRandomNft(payload),
      'Failed to create random NFT sale'
    );
  }

  async checkUtxo(address: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.checkUtxo(address),
      'Failed to check UTXO'
    );
  }

  async getPayoutWallets(): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getPayoutWallets(),
      'Failed to get payout wallets'
    );
  }

  async getRates(): Promise<components['schemas']['PricelistClass']> {
    return this.handleRequest(
      () => this.endpoints.getRates(),
      'Failed to get rates'
    );
  }

  async getAdaRates(): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getAdaRates(),
      'Failed to get ADA rates'
    );
  }

  async getServerState(): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getServerState(),
      'Failed to get server state'
    );
  }

  async getPublicMints(): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getPublicMints(),
      'Failed to get public mints'
    );
  }

  async getCounts(projectUid: string): Promise<GetGetCountsApikeyProjectuid_3ababbResponse> {
    return this.handleRequest(
      () => this.endpoints.getCounts(projectUid),
      'Failed to get counts'
    );
  }

  async getProjectTransactions(projectUid: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getProjectTransactions(projectUid),
      'Failed to get project transactions'
    );
  }

  async getAdditionalPayoutWallets(projectUid: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getAdditionalPayoutWallets(projectUid),
      'Failed to get additional payout wallets'
    );
  }

  async getNftDetailsById(nftUid: string): Promise<GetGetNftDetailsByIdApikeyNftuid_1b8124Response> {
    return this.handleRequest(
      () => this.endpoints.getNftDetailsById(nftUid),
      'Failed to get NFT details by ID'
    );
  }


  async getNfts(projectUid: string, state: string, count: number, page: number): Promise<components['schemas']['NftDetailsClass'][]> {
    return this.handleRequest(
      () => this.endpoints.getNfts(projectUid, state, count, page),
      'Failed to get NFTs'
    );
  }

  async getPaymentAddressForRandomNftSale(projectUid: string, countNft: number, customerIpAddress: string): Promise<components['schemas']['GetPaymentAddressResultClass']> {
    return this.handleRequest(
      () => this.endpoints.getPaymentAddressForRandomNftSale(projectUid, countNft, customerIpAddress),
      'Failed to get payment address for random NFT sale'
    );
  }

  async getAllAssetsInWallet(address: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getAllAssetsInWallet(address),
      'Failed to get all assets in wallet'
    );
  }

  async getWalletUtxo(address: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getWalletUtxo(address),
      'Failed to get wallet UTXO'
    );
  }

  async uploadNft(projectUid: string, payload: any): Promise<components['schemas']['UploadNftResultClass']> {
    return this.handleRequest(
      () => this.endpoints.uploadNft(projectUid, payload),
      'Failed to upload NFT'
    );
  }

  async getNmkrPayStatus(paymentTransactionUid: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getNmkrPayStatus(paymentTransactionUid),
      'Failed to get NMKR pay status'
    );
  }

  async mintAndSendRandom(projectUid: string, countNft: number, receiverAddress: string, blockchain: Chain = 'Cardano'): Promise<GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse> {
    return this.handleRequest(
      () => this.endpoints.mintAndSendRandom(projectUid, countNft, receiverAddress, blockchain),
      'Failed to mint and send random NFT'
    );
  }

  async mintAndSendSpecific(projectUid: string, nftUid: string, tokenCount: number, receiverAddress: string, blockchain: Chain = 'Cardano'): Promise<GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response> {
    return this.handleRequest(
      () => this.endpoints.mintAndSendSpecific(projectUid, nftUid, tokenCount, receiverAddress, blockchain),
      'Failed to mint and send specific NFT'
    );
  }

  async mintAndSendMultipleSpecific(projectUid: string, receiverAddress: string, payload: any, blockchain: Chain = 'Cardano'): Promise<MintResult> {
    return this.handleRequest(
      () => this.endpoints.mintAndSendMultipleSpecific(projectUid, receiverAddress, payload, blockchain),
      'Failed to mint and send multiple specific NFTs'
    );
  }

  async reservePaymentgatewayMintAndSendNft(paymentTransactionUid: string, payload: { receiverAddress: string }): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.reservePaymentgatewayMintAndSendNft(paymentTransactionUid, payload),
      'Failed to reserve paymentgateway mint and send NFT'
    );
  }

  async mintAndSendPaymentgatewayNft(paymentTransactionUid: string, payload: { receiverAddress: string }): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.mintAndSendPaymentgatewayNft(paymentTransactionUid, payload),
      'Failed to mint and send paymentgateway NFT'
    );
  }

  async cancelTransaction(paymentTransactionUid: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.cancelTransaction(paymentTransactionUid),
      'Failed to cancel transaction'
    );
  }

  async getProjectDetails(projectUid: string): Promise<components['schemas']['NftProjectsDetails']> {
    return this.handleRequest(
      () => this.endpoints.getProjectDetails(projectUid),
      'Failed to get project details'
    );
  }

  async createProject(payload: any): Promise<components['schemas']['CreateNewProjectResultClass']> {
    return this.handleRequest(
      () => this.endpoints.createProject(payload),
      'Failed to create project'
    );
  }

  async updateMetadata(projectUid: string, nftUid: string, payload: any): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.updateMetadata(projectUid, nftUid, payload),
      'Failed to update metadata'
    );
  }

  async getPaymentAddressForSpecificNftSale(
    nftUid: string, 
    tokenCount: number, 
    referer?: string, 
    customProperty?: string, 
    optionalReceiverAddress?: string
  ): Promise<components['schemas']['GetPaymentAddressResultClass']> {
    return this.handleRequest(
      () => this.endpoints.getPaymentAddressForSpecificNftSale(nftUid, tokenCount, referer, customProperty, optionalReceiverAddress),
      'Failed to get payment address for specific NFT sale'
    );
  }

  async uploadToIpfs(customerId: number, payload: any): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.uploadToIpfs(customerId, payload),
      'Failed to upload to IPFS'
    );
  }

  async checkAddress(projectUid: string, address: string): Promise<components['schemas']['CheckAddressResultClass']> {
    return this.handleRequest(
      () => this.endpoints.checkAddress(projectUid, address),
      'Failed to check address'
    );
  }

  async cancelAddressReservation(projectUid: string, paymentAddress: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.cancelAddressReservation(projectUid, paymentAddress),
      'Failed to cancel address reservation'
    );
  }

  async getWhitelist(projectUid: string): Promise<any[]> {
    return this.handleRequest(
      () => this.endpoints.getWhitelist(projectUid),
      'Failed to get whitelist'
    );
  }

  async addToWhitelist(projectUid: string, address: string, countOfNfts: number): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.addToWhitelist(projectUid, address, countOfNfts),
      'Failed to add to whitelist'
    );
  }

  async removeFromWhitelist(projectUid: string, address: string): Promise<void> {
    return this.handleRequest(
      () => this.endpoints.removeFromWhitelist(projectUid, address),
      'Failed to remove from whitelist'
    );
  }

  async listProjects(): Promise<any[]> {
    return this.handleRequest(
      () => this.endpoints.listProjects(),
      'Failed to list projects'
    );
  }

  async listProjectsPaginated(count: number, page: number): Promise<any[]> {
    return this.handleRequest(
      () => this.endpoints.listProjectsPaginated(count, page),
      'Failed to list projects with pagination'
    );
  }

  async getSaleConditions(projectUid: string): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.getSaleConditions(projectUid),
      'Failed to get sale conditions'
    );
  }

  async updateSaleConditions(projectUid: string, payload: any): Promise<any> {
    return this.handleRequest(
      () => this.endpoints.updateSaleConditions(projectUid, payload),
      'Failed to update sale conditions'
    );
  }

}
