import { injectable } from "tsyringe";
import { createNmkrHttpClient, NmkrHttpError } from "./http";
import { NmkrEndpoints } from "./endpoints";
import {
  CreatePaymentTransactionSpecificReq,
  CreatePaymentTransactionRandomReq,
  CreatePaymentTransactionRes,
  UploadNftRequest,
  GetNmkrPayStatusResponse,
  MintAndSendResultClass,
  ReserveMultipleNftsClassV2,
  CreateProjectRequest,
  NftProjectsDetails,
  UpdateMetadataRequest,
  GetPaymentAddressForSpecificNftSaleResponse,
  UploadToIpfsRequest,
  UploadToIpfsResponse,
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

  async getNmkrPayStatus(paymentTransactionUid: string): Promise<GetNmkrPayStatusResponse> {
    try {
      return await this.endpoints.getNmkrPayStatus(paymentTransactionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get NMKR pay status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async mintAndSendRandom(projectUid: string, countNft: number, receiverAddress: string, blockchain: string = "Cardano"): Promise<MintAndSendResultClass> {
    try {
      return await this.endpoints.mintAndSendRandom(projectUid, countNft, receiverAddress, blockchain);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to mint and send random NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async mintAndSendSpecific(projectUid: string, nftUid: string, tokenCount: number, receiverAddress: string, blockchain: string = "Cardano"): Promise<MintAndSendResultClass> {
    try {
      return await this.endpoints.mintAndSendSpecific(projectUid, nftUid, tokenCount, receiverAddress, blockchain);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to mint and send specific NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async mintAndSendMultipleSpecific(projectUid: string, receiverAddress: string, payload: ReserveMultipleNftsClassV2, blockchain: string = "Cardano"): Promise<MintAndSendResultClass> {
    try {
      return await this.endpoints.mintAndSendMultipleSpecific(projectUid, receiverAddress, payload, blockchain);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to mint and send multiple specific NFTs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async reservePaymentgatewayMintAndSendNft(paymentTransactionUid: string, payload: { receiverAddress: string }): Promise<any> {
    try {
      return await this.endpoints.reservePaymentgatewayMintAndSendNft(paymentTransactionUid, payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to reserve paymentgateway mint and send NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async mintAndSendPaymentgatewayNft(paymentTransactionUid: string, payload: { receiverAddress: string }): Promise<any> {
    try {
      return await this.endpoints.mintAndSendPaymentgatewayNft(paymentTransactionUid, payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to mint and send paymentgateway NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async cancelTransaction(paymentTransactionUid: string): Promise<any> {
    try {
      return await this.endpoints.cancelTransaction(paymentTransactionUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to cancel transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProjectDetails(projectUid: string): Promise<NftProjectsDetails> {
    try {
      return await this.endpoints.getProjectDetails(projectUid);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get project details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createProject(payload: CreateProjectRequest): Promise<any> {
    try {
      return await this.endpoints.createProject(payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateMetadata(projectUid: string, nftUid: string, payload: UpdateMetadataRequest): Promise<any> {
    try {
      return await this.endpoints.updateMetadata(projectUid, nftUid, payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to update metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPaymentAddressForSpecificNftSale(
    nftUid: string, 
    tokenCount: number, 
    referer?: string, 
    customProperty?: string, 
    optionalReceiverAddress?: string
  ): Promise<GetPaymentAddressForSpecificNftSaleResponse> {
    try {
      return await this.endpoints.getPaymentAddressForSpecificNftSale(nftUid, tokenCount, referer, customProperty, optionalReceiverAddress);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to get payment address for specific NFT sale: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async uploadToIpfs(customerId: number, payload: UploadToIpfsRequest): Promise<UploadToIpfsResponse> {
    try {
      return await this.endpoints.uploadToIpfs(customerId, payload);
    } catch (error) {
      if (error instanceof NmkrHttpError) {
        throw error;
      }
      throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

}
