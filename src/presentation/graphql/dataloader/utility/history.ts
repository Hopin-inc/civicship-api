import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlUtilityHistory } from "@/types/graphql";
import UtilityHistoryOutputFormat from "@/presentation/graphql/dto/utility/history/output";
import { utilityHistoryInclude } from "@/infrastructure/prisma/types/utility/history";

async function batchUtilityHistoriesById(
  issuer: PrismaClientIssuer,
  utilityHistoryIds: readonly string[],
): Promise<(GqlUtilityHistory | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.utilityHistory.findMany({
      where: { id: { in: [...utilityHistoryIds] } },
      include: utilityHistoryInclude,
    });
  });

  const map = new Map(records.map((record) => [record.id, UtilityHistoryOutputFormat.get(record)]));

  return utilityHistoryIds.map((id) => map.get(id) ?? null);
}

export function createUtilityHistoryLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlUtilityHistory | null>((keys) =>
    batchUtilityHistoriesById(issuer, keys),
  );
}
