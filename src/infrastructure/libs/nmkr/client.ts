import { injectable } from "tsyringe";
import { createNmkrHttpClient, NmkrHttpError } from "./http";
import { NmkrEndpoints } from "./endpoints";
import {
  CreatePaymentTransactionSpecificReq,
  CreatePaymentTransactionRandomReq,
  CreatePaymentTransactionRes,
  CheckAddressResponse,
  GetProjectResponse,
  CancelAddressReservationResponse,
  GetTransactionStateResponse,
  GetPaymentAddressResponse,
  SubmitTransactionResponse,
  EndTransactionResponse,
  CancelTransactionResponse,
  ReservePaymentgatewayMintAndSendNftRequest,
  ReservePaymentgatewayMintAndSendNftResponse,
  MintAndSendPaymentgatewayNftRequest,
  MintAndSendPaymentgatewayNftResponse,
} from "./types";

@injectable()
export class NmkrClient {
  private readonly endpoints: NmkrEndpoints;

  constructor() {
    const httpClient = createNmkrHttpClient();
    this.endpoints = new NmkrEndpoints(httpClient);
  }

  async createSpecificNftSale(
    payload: CreatePaymentTransactionSpecificReq,
  ): Promise<CreatePaymentTransactionRes> {
    try {
      return await this.endpoints.createPaymentTransactionForSpecificNft(payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to create specific NFT sale: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createRandomNftSale(
    payload: CreatePaymentTransactionRandomReq,
  ): Promise<CreatePaymentTransactionRes> {
    try {
      return await this.endpoints.createPaymentTransactionForRandomNft(payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to create random NFT sale: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async checkPaymentAddress(
    projectUid: string,
    address: string,
  ): Promise<CheckAddressResponse> {
    try {
      return await this.endpoints.checkAddress(projectUid, address);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to check payment address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProjectInfo(projectUid: string): Promise<GetProjectResponse> {
    try {
      return await this.endpoints.getProject(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get project info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async cancelPaymentReservation(
    projectUid: string,
    paymentAddress: string,
  ): Promise<CancelAddressReservationResponse> {
    try {
      return await this.endpoints.cancelAddressReservation(projectUid, paymentAddress);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to cancel payment reservation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAuctionState(auctionUid: string): Promise<any> {
    try {
      return await this.endpoints.getAuctionState(auctionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get auction state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAllAuctions(customerId: string): Promise<any> {
    try {
      return await this.endpoints.getAllAuctions(customerId);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get all auctions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createAuction(customerId: string, auctionData: any): Promise<any> {
    try {
      return await this.endpoints.createAuction(customerId, auctionData);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to create auction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTransactionState(paymentTransactionUid: string): Promise<GetTransactionStateResponse> {
    try {
      return await this.endpoints.getTransactionState(paymentTransactionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get transaction state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPaymentAddress(paymentTransactionUid: string): Promise<GetPaymentAddressResponse> {
    try {
      return await this.endpoints.getPaymentAddress(paymentTransactionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get payment address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async submitTransaction(paymentTransactionUid: string): Promise<SubmitTransactionResponse> {
    try {
      return await this.endpoints.submitTransaction(paymentTransactionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to submit transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async endTransaction(paymentTransactionUid: string): Promise<EndTransactionResponse> {
    try {
      return await this.endpoints.endTransaction(paymentTransactionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to end transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async cancelTransaction(paymentTransactionUid: string): Promise<CancelTransactionResponse> {
    try {
      return await this.endpoints.cancelTransaction(paymentTransactionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to cancel transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async reservePaymentgatewayMintAndSendNft(
    paymentTransactionUid: string,
    payload: ReservePaymentgatewayMintAndSendNftRequest,
  ): Promise<ReservePaymentgatewayMintAndSendNftResponse> {
    try {
      return await this.endpoints.reservePaymentgatewayMintAndSendNft(paymentTransactionUid, payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to reserve mint and send NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async mintAndSendPaymentgatewayNft(
    paymentTransactionUid: string,
    payload: MintAndSendPaymentgatewayNftRequest,
  ): Promise<MintAndSendPaymentgatewayNftResponse> {
    try {
      return await this.endpoints.mintAndSendPaymentgatewayNft(paymentTransactionUid, payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to mint and send NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }


  async getNmkrPayStatus(paymentTransactionUid: string): Promise<any> {
    try {
      return await this.endpoints.getNmkrPayStatus(paymentTransactionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get NMKR pay status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProjectStats(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getProjectStats(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get project stats: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAllProjects(): Promise<any> {
    try {
      return await this.endpoints.getAllProjects();
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get all projects: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNftDetails(nftUid: string): Promise<any> {
    try {
      return await this.endpoints.getNftDetails(nftUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get NFT details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProjectNfts(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getProjectNfts(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get project NFTs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async blockUnblockNft(nftUid: string, blockNft: boolean): Promise<any> {
    try {
      return await this.endpoints.blockUnblockNft(nftUid, blockNft);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to block/unblock NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async checkMetadata(nftUid: string): Promise<any> {
    try {
      return await this.endpoints.checkMetadata(nftUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to check metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async duplicateNft(nftUid: string): Promise<any> {
    try {
      return await this.endpoints.duplicateNft(nftUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to duplicate NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }


  async checkIfEligibleForDiscount(projectUid: string, address: string): Promise<any> {
    try {
      return await this.endpoints.checkIfEligibleForDiscount(projectUid, address);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to check discount eligibility: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async checkIfSaleConditionsMet(projectUid: string, address: string, countNft: number): Promise<any> {
    try {
      return await this.endpoints.checkIfSaleConditionsMet(projectUid, address, countNft);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to check sale conditions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async checkUtxo(address: string): Promise<any> {
    try {
      return await this.endpoints.checkUtxo(address);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to check UTXO: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createBurningAddress(projectUid: string, addressActiveInHours: number): Promise<any> {
    try {
      return await this.endpoints.createBurningAddress(projectUid, addressActiveInHours);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to create burning address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async addPayoutWallet(walletAddress: string): Promise<any> {
    try {
      return await this.endpoints.addPayoutWallet(walletAddress);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to add payout wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getRates(): Promise<any> {
    try {
      return await this.endpoints.getRates();
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get rates: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAdaRates(): Promise<any> {
    try {
      return await this.endpoints.getAdaRates();
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get ADA rates: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getServerState(): Promise<any> {
    try {
      return await this.endpoints.getServerState();
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get server state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPublicMints(): Promise<any> {
    try {
      return await this.endpoints.getPublicMints();
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get public mints: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getCounts(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getCounts(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get counts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getDiscounts(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getDiscounts(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get discounts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNotifications(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getNotifications(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get notifications: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPricelist(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getPricelist(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get pricelist: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProjectTransactions(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getProjectTransactions(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get project transactions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getRefunds(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getRefunds(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get refunds: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSaleConditions(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getSaleConditions(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get sale conditions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAdditionalPayoutWallets(projectUid: string): Promise<any> {
    try {
      return await this.endpoints.getAdditionalPayoutWallets(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get additional payout wallets: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNftDetailsById(nftUid: string): Promise<any> {
    try {
      return await this.endpoints.getNftDetailsById(nftUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get NFT details by ID: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNftDetailsByTokenname(projectUid: string, nftName: string): Promise<any> {
    try {
      return await this.endpoints.getNftDetailsByTokenname(projectUid, nftName);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get NFT details by token name: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNfts(projectUid: string, state: string, count: number, page: number): Promise<any> {
    try {
      return await this.endpoints.getNfts(projectUid, state, count, page);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get NFTs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPaymentAddressForRandomNftSale(projectUid: string, countNft: number, price?: number): Promise<any> {
    try {
      return await this.endpoints.getPaymentAddressForRandomNftSale(projectUid, countNft, price);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get payment address for random NFT sale: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPaymentAddressForSpecificNftSale(nftUid: string, tokenCount: number, price?: number): Promise<any> {
    try {
      return await this.endpoints.getPaymentAddressForSpecificNftSale(nftUid, tokenCount, price);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get payment address for specific NFT sale: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAllAssetsInWallet(address: string): Promise<any> {
    try {
      return await this.endpoints.getAllAssetsInWallet(address);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get all assets in wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getWalletUtxo(address: string): Promise<any> {
    try {
      return await this.endpoints.getWalletUtxo(address);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get wallet UTXO: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createProject(projectData: any): Promise<any> {
    try {
      return await this.endpoints.createProject(projectData);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createWallet(customerId: string, walletData: any): Promise<any> {
    try {
      return await this.endpoints.createWallet(customerId, walletData);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
