import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTransaction } from "@/types/graphql";
import { transactionInclude } from "@/application/transaction/infrastructure/type";
import TransactionOutputFormat from "@/application/transaction/presenter";

async function batchTransactionsById(
  issuer: PrismaClientIssuer,
  transactionIds: readonly string[],
): Promise<(GqlTransaction | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.transaction.findMany({
      where: { id: { in: [...transactionIds] } },
      include: transactionInclude,
    });
  });

  const map = new Map(records.map((record) => [record.id, TransactionOutputFormat.get(record)]));
  return transactionIds.map((id) => map.get(id) ?? null);
}

export function createTransactionLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlTransaction | null>((keys) =>
    batchTransactionsById(issuer, keys),
  );
}
