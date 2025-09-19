import { injectable } from "tsyringe";
import { createNmkrHttpClient, NmkrHttpError } from "./http";
import { NmkrEndpoints } from "./endpoints";
import {
  CreatePaymentTransactionSpecificReq,
  CreatePaymentTransactionRandomReq,
  CreatePaymentTransactionRes,
  UploadNftRequest,
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

  async getPaymentAddressForRandomNftSale(projectUid: string, countNft: number, customerIpAddress: string): Promise<any> {
    try {
      return await this.endpoints.getPaymentAddressForRandomNftSale(projectUid, countNft, customerIpAddress);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get payment address for random NFT sale: ${error instanceof Error ? error.message : String(error)}`);
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

  async uploadNft(projectUid: string, payload: UploadNftRequest): Promise<any> {
    try {
      return await this.endpoints.uploadNft(projectUid, payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to upload NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

}
