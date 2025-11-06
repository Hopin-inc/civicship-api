import { PrismaClient } from "@prisma/client";
import { GqlParticipation } from "@/types/graphql";
import {
  participationSelectDetail,
  PrismaParticipationDetail,
} from "@/application/domain/experience/participation/data/type";
import ParticipationOutputFormat from "@/application/domain/experience/participation/presenter";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";
import ParticipationPresenter from "@/application/domain/experience/participation/presenter";

export function createParticipationLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaParticipationDetail, GqlParticipation>(
    async (ids) =>
      prisma.participation.findMany({
        where: { id: { in: [...ids] } },
        select: participationSelectDetail,
      }),
    ParticipationOutputFormat.get,
  );
}

export function createParticipationsByReservationLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"reservationId", PrismaParticipationDetail, GqlParticipation>(
    "reservationId",
    async (reservationIds) => {
      return prisma.participation.findMany({
        where: {
          reservationId: { in: [...reservationIds] },
        },
        include: {
          evaluation: true
        }
      });
    },
    ParticipationPresenter.get,
  );
}

export function createParticipationsByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"userId", PrismaParticipationDetail, GqlParticipation>(
    "userId",
    async (userIds) => {
      return prisma.participation.findMany({
        where: { userId: { in: [...userIds] } },
      });
    },
    ParticipationPresenter.get,
  );
}

export function createParticipationsByCommunityLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"communityId", PrismaParticipationDetail, GqlParticipation>(
    "communityId",
    async (communityIds) => {
      return prisma.participation.findMany({
        where: { communityId: { in: [...communityIds] } },
      });
    },
    ParticipationPresenter.get,
  );
}
