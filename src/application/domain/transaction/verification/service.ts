import { injectable, inject } from "tsyringe";
import { PointVerifyClient, VerifyResponse } from "@/infrastructure/libs/point-verify/client";

@injectable()
export default class TransactionVerificationService {
  constructor(
    @inject("PointVerifyClient")
    private readonly pointVerifyClient: PointVerifyClient,
  ) {}

  async verifyTransactions(txIds: string[]): Promise<VerifyResponse[]> {
    return this.pointVerifyClient.verifyTransactions(txIds);
  }
}
