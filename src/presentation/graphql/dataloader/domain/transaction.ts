import * as TransactionLoaders from "@/application/domain/transaction/controller/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export function createTransactionLoaders(issuer: PrismaClientIssuer) {
  return {
    transaction: TransactionLoaders.createTransactionLoader(issuer),
    transactionsByParticipation: TransactionLoaders.createTransactionsByParticipationLoader(issuer),
    transactionsByWallet: TransactionLoaders.createTransactionsByWalletLoader(issuer),
  };
}
