import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlParticipation } from "@/types/graphql";
import { participationSelectDetail } from "@/application/domain/experience/participation/data/type";
import ParticipationOutputFormat from "@/application/domain/experience/participation/presenter";

async function batchParticipationsById(
  issuer: PrismaClientIssuer,
  participationIds: readonly string[],
): Promise<(GqlParticipation | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.participation.findMany({
      where: { id: { in: [...participationIds] } },
      select: participationSelectDetail,
    });
  });

  const map = new Map(records.map((record) => [record.id, ParticipationOutputFormat.get(record)])) as Map<string, GqlParticipation | null>;

  return participationIds.map((id) => map.get(id) ?? null);
}

export function createParticipationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlParticipation | null>((keys) =>
    batchParticipationsById(issuer, keys),
  );
}
