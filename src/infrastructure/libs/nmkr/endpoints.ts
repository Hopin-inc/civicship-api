import { AxiosInstance } from "axios";
import {
  CreatePaymentTransactionRes,
  CreatePaymentTransactionSpecificReq,
  CreatePaymentTransactionRandomReq,
  CheckAddressResponse,
  GetProjectResponse,
  CancelAddressReservationResponse,
} from "@/infrastructure/libs/nmkr/types";

export class NmkrEndpoints {
  constructor(private readonly http: AxiosInstance) {}

  async createPaymentTransactionForSpecificNft(
    payload: CreatePaymentTransactionSpecificReq,
  ): Promise<CreatePaymentTransactionRes> {
    const { data } = await this.http.post("/v2/CreatePaymentTransaction", payload, {
      responseType: "text" as any,
      transformResponse: [
        (raw) => {
          if (typeof raw === "string") {
            try {
              return JSON.parse(raw);
            } catch {
              return raw;
            }
          }
          return raw;
        },
      ],
    });
    return data as CreatePaymentTransactionRes;
  }

  async createPaymentTransactionForRandomNft(
    payload: CreatePaymentTransactionRandomReq,
  ): Promise<CreatePaymentTransactionRes> {
    const { data } = await this.http.post("/v2/CreatePaymentTransaction", payload, {
      responseType: "text" as any,
      transformResponse: [
        (raw) => {
          if (typeof raw === "string") {
            try {
              return JSON.parse(raw);
            } catch {
              return raw;
            }
          }
          return raw;
        },
      ],
    });
    return data as CreatePaymentTransactionRes;
  }

  async checkAddress(
    projectUid: string,
    address: string,
  ): Promise<CheckAddressResponse> {
    const { data } = await this.http.get(
      `/v2/CheckAddress/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`,
    );
    return data as CheckAddressResponse;
  }

  async getProject(projectUid: string): Promise<GetProjectResponse> {
    const { data } = await this.http.get(`/v2/GetProjectDetails/${encodeURIComponent(projectUid)}`);
    return data as GetProjectResponse;
  }

  async cancelAddressReservation(
    projectUid: string,
    paymentAddress: string,
  ): Promise<CancelAddressReservationResponse> {
    const { data } = await this.http.get(
      `/v2/CancelAddressReservation/${encodeURIComponent(projectUid)}/${encodeURIComponent(paymentAddress)}`,
    );
    return data as CancelAddressReservationResponse;
  }

  async getAuctionState(auctionUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetAuctionState/${encodeURIComponent(auctionUid)}`);
    return data;
  }

  async getAllAuctions(customerId: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetAllAuctions/${encodeURIComponent(customerId)}`);
    return data;
  }

  async createAuction(customerId: string, auctionData: any): Promise<any> {
    const { data } = await this.http.post(`/v2/CreateAuction/${encodeURIComponent(customerId)}`, auctionData);
    return data;
  }


  async getNmkrPayStatus(paymentTransactionUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetNmkrPayStatus/${encodeURIComponent(paymentTransactionUid)}`);
    return data;
  }

  async getProjectStats(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetProjectStats/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getAllProjects(): Promise<any> {
    const { data } = await this.http.get('/v2/GetAllProjects');
    return data;
  }

  async getNftDetails(nftUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetNftDetails/${encodeURIComponent(nftUid)}`);
    return data;
  }

  async getProjectNfts(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetProjectNfts/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async blockUnblockNft(nftUid: string, blockNft: boolean): Promise<any> {
    const { data } = await this.http.get(`/v2/BlockUnblockNft/${encodeURIComponent(nftUid)}/${blockNft}`);
    return data;
  }

  async checkMetadata(nftUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/CheckMetadata/${encodeURIComponent(nftUid)}`);
    return data;
  }

  async duplicateNft(nftUid: string): Promise<any> {
    const { data } = await this.http.post(`/v2/DuplicateNft/${encodeURIComponent(nftUid)}`, {});
    return data;
  }


  async checkIfEligibleForDiscount(projectUid: string, address: string): Promise<any> {
    const { data } = await this.http.get(
      `/v2/CheckIfEligibleForDiscount/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}`,
    );
    return data;
  }

  async checkIfSaleConditionsMet(projectUid: string, address: string, countNft: number): Promise<any> {
    const { data } = await this.http.get(
      `/v2/CheckIfSaleConditionsMet/${encodeURIComponent(projectUid)}/${encodeURIComponent(address)}/${countNft}`,
    );
    return data;
  }

  async checkUtxo(address: string): Promise<any> {
    const { data } = await this.http.get(`/v2/CheckUtxo/${encodeURIComponent(address)}`);
    return data;
  }

  async createBurningAddress(projectUid: string, addressActiveInHours: number): Promise<any> {
    const { data } = await this.http.get(
      `/v2/CreateBurningAddress/${encodeURIComponent(projectUid)}/${addressActiveInHours}`,
    );
    return data;
  }

  async addPayoutWallet(walletAddress: string): Promise<any> {
    const { data } = await this.http.get(`/v2/AddPayoutWallet/${encodeURIComponent(walletAddress)}`);
    return data;
  }

  async getRates(): Promise<any> {
    const { data } = await this.http.get('/v2/GetRates');
    return data;
  }

  async getAdaRates(): Promise<any> {
    const { data } = await this.http.get('/v2/GetAdaRates');
    return data;
  }

  async getServerState(): Promise<any> {
    const { data } = await this.http.get('/v2/GetServerState');
    return data;
  }

  async getPublicMints(): Promise<any> {
    const { data } = await this.http.get('/v2/GetPublicMints');
    return data;
  }

  async getCounts(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetCounts/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getDiscounts(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetDiscounts/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getNotifications(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetNotifications/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getPricelist(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetPricelist/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getProjectTransactions(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetProjectTransactions/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getRefunds(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetRefunds/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getSaleConditions(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetSaleConditions/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getAdditionalPayoutWallets(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetAdditionalPayoutWallets/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getNftDetailsById(nftUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetNftDetailsById/${encodeURIComponent(nftUid)}`);
    return data;
  }

  async getNftDetailsByTokenname(projectUid: string, nftName: string): Promise<any> {
    const { data } = await this.http.get(
      `/v2/GetNftDetailsByTokenname/${encodeURIComponent(projectUid)}/${encodeURIComponent(nftName)}`,
    );
    return data;
  }

  async getNfts(projectUid: string, state: string, count: number, page: number): Promise<any> {
    const { data } = await this.http.get(
      `/v2/GetNfts/${encodeURIComponent(projectUid)}/${state}/${count}/${page}`,
    );
    return data;
  }

  async getPaymentAddressForRandomNftSale(projectUid: string, countNft: number, price?: number): Promise<any> {
    const endpoint = price 
      ? `/v2/GetPaymentAddressForRandomNftSale/${encodeURIComponent(projectUid)}/${countNft}/${price}`
      : `/v2/GetPaymentAddressForRandomNftSale/${encodeURIComponent(projectUid)}/${countNft}`;
    const { data } = await this.http.get(endpoint);
    return data;
  }

  async getPaymentAddressForSpecificNftSale(nftUid: string, tokenCount: number, price?: number): Promise<any> {
    const endpoint = price
      ? `/v2/GetPaymentAddressForSpecificNftSale/${encodeURIComponent(nftUid)}/${tokenCount}/${price}`
      : `/v2/GetPaymentAddressForSpecificNftSale/${encodeURIComponent(nftUid)}/${tokenCount}`;
    const { data } = await this.http.get(endpoint);
    return data;
  }

  async getAllAssetsInWallet(address: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetAllAssetsInWallet/${encodeURIComponent(address)}`);
    return data;
  }

  async getWalletUtxo(address: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetWalletUtxo/${encodeURIComponent(address)}`);
    return data;
  }

  async createProject(projectData: any): Promise<any> {
    const { data } = await this.http.post('/v2/CreateProject', projectData);
    return data;
  }

  async createWallet(customerId: string, walletData: any): Promise<any> {
    const { data } = await this.http.post(`/v2/CreateWallet/${encodeURIComponent(customerId)}`, walletData);
    return data;
  }
}
