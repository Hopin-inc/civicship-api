import { AxiosInstance } from "axios";
import {
  CreatePaymentTransactionRes,
  CreatePaymentTransactionSpecificReq,
  CreatePaymentTransactionRandomReq,
  UploadNftRequest,
  ReserveMultipleNftsClassV2,
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





  async checkUtxo(address: string): Promise<any> {
    const { data } = await this.http.get(`/v2/CheckUtxo/${encodeURIComponent(address)}`);
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



  async getProjectTransactions(projectUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetProjectTransactions/${encodeURIComponent(projectUid)}`);
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

  async getNmkrPayStatus(paymentTransactionUid: string): Promise<any> {
    const { data } = await this.http.get(`/v2/GetNmkrPayStatus/${encodeURIComponent(paymentTransactionUid)}`, {
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
    return data;
  }

  async mintAndSendRandom(projectUid: string, countNft: number, receiverAddress: string, blockchain: string = "Cardano"): Promise<any> {
    const { data } = await this.http.get(
      `/v2/MintAndSendRandom/${encodeURIComponent(projectUid)}/${countNft}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`,
      {
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
      }
    );
    return data;
  }

  async mintAndSendSpecific(projectUid: string, nftUid: string, tokenCount: number, receiverAddress: string, blockchain: string = "Cardano"): Promise<any> {
    const { data } = await this.http.get(
      `/v2/MintAndSendSpecific/${encodeURIComponent(projectUid)}/${encodeURIComponent(nftUid)}/${tokenCount}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`,
      {
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
      }
    );
    return data;
  }

  async mintAndSendMultipleSpecific(projectUid: string, receiverAddress: string, payload: ReserveMultipleNftsClassV2, blockchain: string = "Cardano"): Promise<any> {
    const { data } = await this.http.post(
      `/v2/MintAndSendSpecific/${encodeURIComponent(projectUid)}/${encodeURIComponent(receiverAddress)}?blockchain=${blockchain}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
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
      }
    );
    return data;
  }

  async reservePaymentgatewayMintAndSendNft(paymentTransactionUid: string, payload: { receiverAddress: string }): Promise<any> {
    const { data } = await this.http.post(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/ReservePaymentgatewayMintAndSendNft`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
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
      }
    );
    return data;
  }

  async mintAndSendPaymentgatewayNft(paymentTransactionUid: string, payload: { receiverAddress: string }): Promise<any> {
    const { data } = await this.http.post(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/MintAndSendPaymentgatewayNft`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
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
      }
    );
    return data;
  }

  async cancelTransaction(paymentTransactionUid: string): Promise<any> {
    const { data } = await this.http.post(
      `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/CancelTransaction`,
      {},
      {
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
      }
    );
    return data;
  }

}
