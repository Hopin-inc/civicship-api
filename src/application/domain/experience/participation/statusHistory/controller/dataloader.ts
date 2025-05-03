import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlParticipationStatusHistory } from "@/types/graphql";
import { 
  participationStatusHistorySelectDetail,
  PrismaParticipationStatusHistoryDetail
} from "@/application/domain/experience/participation/statusHistory/data/type";
import ParticipationStatusHistoryPresenter from "@/application/domain/experience/participation/statusHistory/presenter";

async function batchParticipationStatusHistoriesById(
  issuer: PrismaClientIssuer,
  ids: readonly string[],
): Promise<(GqlParticipationStatusHistory | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.participationStatusHistory.findMany({
      where: { id: { in: [...ids] } },
      select: participationStatusHistorySelectDetail,
    });
  }) as PrismaParticipationStatusHistoryDetail[];

  const map = new Map(
    records.map((record) => [record.id, ParticipationStatusHistoryPresenter.get(record)]),
  );

  return ids.map((id) => map.get(id) ?? null);
}

export function createParticipationStatusHistoryLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlParticipationStatusHistory | null>((keys) =>
    batchParticipationStatusHistoriesById(issuer, keys),
  );
}
