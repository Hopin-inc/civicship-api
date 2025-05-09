import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlParticipation } from "@/types/graphql";
import {
  participationSelectDetail,
  PrismaParticipationDetail,
} from "@/application/domain/experience/participation/data/type";
import ParticipationOutputFormat from "@/application/domain/experience/participation/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";
import ParticipationPresenter from "@/application/domain/experience/participation/presenter";

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

  const map = new Map(records.map((record) => [record.id, ParticipationOutputFormat.get(record)]));

  return participationIds.map((id) => map.get(id) ?? null);
}

export function createParticipationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlParticipation | null>((keys) =>
    batchParticipationsById(issuer, keys),
  );
}

export function createParticipationsByReservationLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"reservationId", PrismaParticipationDetail, GqlParticipation>(
    "reservationId",
    async (reservationIds) => {
      return issuer.internal((tx) =>
        tx.participation.findMany({
          where: {
            reservationId: { in: [...reservationIds] },
          },
        }),
      );
    },
    ParticipationPresenter.get,
  );
}

export function createParticipationsByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"userId", PrismaParticipationDetail, GqlParticipation>(
    "userId",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.participation.findMany({
          where: { userId: { in: [...userIds] } },
        }),
      );
    },
    ParticipationPresenter.get,
  );
}

export function createParticipationsByCommunityLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"communityId", PrismaParticipationDetail, GqlParticipation>(
    "communityId",
    async (communityIds) => {
      return issuer.internal((tx) =>
        tx.participation.findMany({
          where: { communityId: { in: [...communityIds] } },
        }),
      );
    },
    ParticipationPresenter.get,
  );
}
