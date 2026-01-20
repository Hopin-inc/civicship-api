import * as TransactionLoaders from "@/application/domain/transaction/controller/dataloader";
import * as IncentiveGrantLoaders from "@/application/domain/transaction/incentiveGrant/controller/dataloader";
import { PrismaClient } from "@prisma/client";

export function createTransactionLoaders(prisma: PrismaClient) {
  return {
    transaction: TransactionLoaders.createTransactionLoader(prisma),
    transactionsByParticipation: TransactionLoaders.createTransactionsByParticipationLoader(prisma),
    transactionsByWallet: TransactionLoaders.createTransactionsByWalletLoader(prisma),
    incentiveGrant: IncentiveGrantLoaders.createIncentiveGrantLoader(prisma),
  };
}
