import { AxiosInstance } from "axios";
import {
  CreatePaymentTransactionRes,
  CreatePaymentTransactionSpecificReq,
  CreatePaymentTransactionRandomReq,
  UploadNftRequest,
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


  async getPayoutWallets(): Promise<any> {
    const { data } = await this.http.get('/v2/GetPayoutWallets');
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

  async getSolanaRates(): Promise<any> {
    const { data } = await this.http.get('/v2/GetSolanaRates');
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


  async getProjectTransactions(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetProjectTransactions/${encodeURIComponent(projectUid)}`);
    return data;
  }

  async getRefunds(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetRefunds/${encodeURIComponent(projectUid)}`);
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


  async getPaymentAddressForRandomNftSale(projectUid: string, countNft: number, customerIpAddress: string): Promise<any> {
    const { data } = await this.http.get(
      `/v2/GetPaymentAddressForRandomNftSale/${encodeURIComponent(projectUid)}/${countNft}/${encodeURIComponent(customerIpAddress)}`,
    );
    return data;
  }


  async getAllAssetsInWallet(address: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetAllAssetsInWallet/${encodeURIComponent(address)}`);
    return data;
  }

  async getNfts(projectUid: string, state: string, count: number, page: number): Promise<any> {
    const { data } = await this.http.get(
      `/v2/GetNfts/${encodeURIComponent(projectUid)}/${state}/${count}/${page}`,
    );
    return data;
  }


  async getWalletUtxo(address: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetWalletUtxo/${encodeURIComponent(address)}`);
    return data;
  }

  async uploadNft(projectUid: string, payload: UploadNftRequest): Promise<any> {
    const { data } = await this.http.post(`/v2/UploadNft/${encodeURIComponent(projectUid)}?uploadsource=api`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
      },
      responseType: "text",
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
    return data;
  }

}
