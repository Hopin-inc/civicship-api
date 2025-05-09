import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTransaction } from "@/types/graphql";
import {
  transactionSelectDetail,
  PrismaTransactionDetail,
} from "@/application/domain/transaction/data/type";
import TransactionPresenter from "@/application/domain/transaction/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";
import { Transaction } from "@prisma/client";

async function batchTransactionsById(
  issuer: PrismaClientIssuer,
  transactionIds: readonly string[],
): Promise<(GqlTransaction | null)[]> {
  const records = (await issuer.internal(async (tx) => {
    return tx.transaction.findMany({
      where: { id: { in: [...transactionIds] } },
      select: transactionSelectDetail,
    });
  })) as PrismaTransactionDetail[];

  const map = new Map(records.map((record) => [record.id, TransactionPresenter.get(record)]));
  return transactionIds.map((id) => map.get(id) ?? null);
}

export function createTransactionLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlTransaction | null>((keys) =>
    batchTransactionsById(issuer, keys),
  );
}

export function createTransactionsByParticipationLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"participationId", Transaction, GqlTransaction>(
    "participationId",
    async (participationIds) => {
      return issuer.internal((tx) =>
        tx.transaction.findMany({
          where: {
            participationId: { in: [...participationIds] },
          },
          select: transactionSelectDetail,
        }),
      );
    },
    TransactionPresenter.get,
  );
}
