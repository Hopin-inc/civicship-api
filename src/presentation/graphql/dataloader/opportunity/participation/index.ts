import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlParticipation } from "@/types/graphql";
import { participationInclude } from "@/infrastructure/prisma/types/opportunity/participation";
import ParticipationOutputFormat from "@/presentation/graphql/dto/opportunity/participation/output";

async function batchParticipationsById(
  issuer: PrismaClientIssuer,
  participationIds: readonly string[],
): Promise<(GqlParticipation | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.participation.findMany({
      where: { id: { in: [...participationIds] } },
      include: participationInclude,
    });
  });

  const map = new Map(records.map((record) => [record.id, ParticipationOutputFormat.get(record)]));

  return participationIds.map((id) => map.get(id) ?? null);
}

export function createParticipationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlParticipation | null>((keys) =>
    batchParticipationsById(issuer, keys),
  );
}
