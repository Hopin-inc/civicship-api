import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/prisma/client";
import { GqlParticipationStatusHistory } from "@/types/graphql";
import { participationStatusHistoryInclude } from "@/domains/opportunity/participation/statusHistory/type";
import ParticipationStatusHistoryOutputFormat from "@/domains/opportunity/participation/statusHistory/presenter/output";

async function batchParticipationStatusHistoriesById(
  issuer: PrismaClientIssuer,
  ids: readonly string[],
): Promise<(GqlParticipationStatusHistory | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.participationStatusHistory.findMany({
      where: { id: { in: [...ids] } },
      include: participationStatusHistoryInclude,
    });
  });

  const map = new Map(
    records.map((record) => [record.id, ParticipationStatusHistoryOutputFormat.get(record)]),
  );

  return ids.map((id) => map.get(id) ?? null);
}

export function createParticipationStatusHistoryLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlParticipationStatusHistory | null>((keys) =>
    batchParticipationStatusHistoriesById(issuer, keys),
  );
}
