import { AxiosInstance } from "axios";
import {
  CreatePaymentTransactionRes,
  CreatePaymentTransactionSpecificReq,
} from "@/infrastructure/libs/nmkr/types";

export class NmkrEndpoints {
  constructor(private readonly http: AxiosInstance) {}

  async createPaymentTransactionForSpecificNft(
    payload: CreatePaymentTransactionSpecificReq,
  ): Promise<CreatePaymentTransactionRes> {
    const { data } = await this.http.post("/v2/CreatePaymentTransaction", payload, {
      // text/plain で JSON文字列が返る事に備えつつ、http.ts 側でも transform 済みなら不要
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
  //
  // /** 取引状態の確認 */
  // async getTransactionState(paymentTransactionUid: string): Promise<GetTransactionStateOutput> {
  //   const { data } = await this.http.get(
  //     `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/GetTransactionState`,
  //   );
  //   // data のキーはSwaggerに合わせて必要なら整形
  //   return { state: data?.state, updatedAt: data?.updatedAt };
  // }
  //
  // /** 取引キャンセル */
  // async cancelTransaction(paymentTransactionUid: string): Promise<void> {
  //   await this.http.post(
  //     `/v2/ProceedPaymentTransaction/${encodeURIComponent(paymentTransactionUid)}/CancelTransaction`,
  //     {},
  //   );
  // }
  //
  // /** ペイアウトウォレット追加 */
  // async addPayoutWallet(walletAddress: string): Promise<void> {
  //   await this.http.post(`/v2/AddPayoutWallet/${encodeURIComponent(walletAddress)}`, {});
  // }
  //
  // /** ペイアウトウォレット一覧 */
  // async getPayoutWallets(): Promise<PayoutWallet[]> {
  //   const { data } = await this.http.get("/v2/GetPayoutWallets");
  //   // 必要なら shape を合わせる
  //   return (data?.wallets ?? data ?? []).map((w: any) => ({
  //     address: w?.address ?? w,
  //     addedAt: w?.addedAt,
  //   }));
  // }
}
