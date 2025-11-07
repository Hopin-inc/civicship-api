import { PrismaClient } from "@prisma/client";
import { GqlTransaction } from "@/types/graphql";
import {
  transactionSelectDetail,
  PrismaTransactionDetail,
} from "@/application/domain/transaction/data/type";
import TransactionPresenter from "@/application/domain/transaction/presenter";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";
import { Transaction } from "@prisma/client";

export function createTransactionLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaTransactionDetail, GqlTransaction>(
    async (ids) =>
      prisma.transaction.findMany({
        where: { id: { in: [...ids] } },
        select: transactionSelectDetail,
      }),
    TransactionPresenter.get,
  );
}

export function createTransactionsByParticipationLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"participationId", Transaction, GqlTransaction>(
    "participationId",
    async (participationIds) => {
      return prisma.transaction.findMany({
        where: {
          participationId: { in: [...participationIds] },
        },
        select: transactionSelectDetail,
      });
    },
    TransactionPresenter.get,
  );
}

export function createTransactionsByWalletLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<
    "walletId",
    { walletId: string } & PrismaTransactionDetail,
    GqlTransaction
  >(
    "walletId",
    async (walletIds) => {
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [{ from: { in: [...walletIds] } }, { to: { in: [...walletIds] } }],
        },
      });

      const deduped: Array<{ walletId: string } & (typeof transactions)[number]> = [];
      const seen = new Map<string, Set<string>>();

      for (const tx of transactions) {
        for (const field of ["from", "to"] as const) {
          const walletId = tx[field];
          if (!walletId) continue;

          if (!seen.has(walletId)) seen.set(walletId, new Set());
          const set = seen.get(walletId)!;

          if (!set.has(tx.id)) {
            set.add(tx.id);
            deduped.push({ ...tx, walletId });
          }
        }
      }

      return deduped;
    },
    TransactionPresenter.get,
  );
}
