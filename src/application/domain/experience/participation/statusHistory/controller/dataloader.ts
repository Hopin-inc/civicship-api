import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import { GqlParticipationStatusHistory } from "@/types/graphql";
import {
  participationStatusHistorySelectDetail,
  PrismaParticipationStatusHistoryDetail,
} from "@/application/domain/experience/participation/statusHistory/data/type";
import ParticipationStatusHistoryPresenter from "@/application/domain/experience/participation/statusHistory/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";
import { ParticipationStatusHistory } from "@prisma/client";

async function batchParticipationStatusHistoriesById(
  prisma: PrismaClient,
  ids: readonly string[],
): Promise<(GqlParticipationStatusHistory | null)[]> {
  const records = (await prisma.participationStatusHistory.findMany({
    where: { id: { in: [...ids] } },
    select: participationStatusHistorySelectDetail,
  })) as PrismaParticipationStatusHistoryDetail[];

  const map = new Map(
    records.map((record) => [record.id, ParticipationStatusHistoryPresenter.get(record)])
  );

  return ids.map((id) => map.get(id) ?? null);
}

export function createParticipationStatusHistoryLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlParticipationStatusHistory | null>((keys) =>
    batchParticipationStatusHistoriesById(prisma, keys)
  );
}

export function createParticipationStatusHistoriesByParticipationLoader(
  prisma: PrismaClient,
) {
  return createHasManyLoaderByKey<
    "participationId",
    ParticipationStatusHistory,
    GqlParticipationStatusHistory
  >(
    "participationId",
    async (participationIds) => {
      return prisma.participationStatusHistory.findMany({
        where: {
          participationId: { in: [...participationIds] },
        },
      });
    },
    ParticipationStatusHistoryPresenter.get,
  );
}
