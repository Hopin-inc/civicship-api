import { PrismaClient } from "@prisma/client";
import {
  PrismaReservationDetail,
  reservationSelectDetail,
} from "@/application/domain/experience/reservation/data/type";
import ReservationPresenter from "@/application/domain/experience/reservation/presenter";
import { GqlReservation } from "@/types/graphql";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createReservationLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaReservationDetail, GqlReservation>(
    async (ids) =>
      prisma.reservation.findMany({
        where: { id: { in: [...ids] } },
        select: reservationSelectDetail,
      }),
    ReservationPresenter.get,
  );
}

export function createReservationsByOpportunitySlotLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"opportunitySlotId", PrismaReservationDetail, GqlReservation>(
    "opportunitySlotId",
    async (opportunitySlotIds) => {
      return prisma.reservation.findMany({
        where: {
          opportunitySlotId: { in: [...opportunitySlotIds] },
        },
        include: {
          participations: {
            include: {
              evaluation: true
            }
          }
        }
      });
    },
    ReservationPresenter.get,
  );
}

export function createReservationsCreatedByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"createdBy", PrismaReservationDetail, GqlReservation>(
    "createdBy",
    async (userIds) => {
      return prisma.reservation.findMany({
        where: {
          createdBy: { in: [...userIds] },
        },
        include: {
          participations: {
            include: { evaluation: true },
          }
        }
      });
    },
    ReservationPresenter.get,
  );
}
