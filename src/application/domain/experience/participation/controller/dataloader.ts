import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createParticipationLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaParticipationDetail, GqlParticipation>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.participation.findMany({
          where: { id: { in: [...ids] } },
          select: participationSelectDetail,
        }),
      ),
    ParticipationOutputFormat.get,
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
          include: {
            evaluation: true
          }
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
