import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createReservationLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaReservationDetail, GqlReservation>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.reservation.findMany({
          where: { id: { in: [...ids] } },
          select: reservationSelectDetail,
        }),
      ),
    ReservationPresenter.get,
  );
}

export function createReservationsByOpportunitySlotLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"opportunitySlotId", PrismaReservationDetail, GqlReservation>(
    "opportunitySlotId",
    async (opportunitySlotIds) => {
      return issuer.internal((tx) =>
        tx.reservation.findMany({
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
        }),
      );
    },
    ReservationPresenter.get,
  );
}

export function createReservationsCreatedByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"createdBy", PrismaReservationDetail, GqlReservation>(
    "createdBy",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.reservation.findMany({
          where: {
            createdBy: { in: [...userIds] },
          },
        }),
      );
    },
    ReservationPresenter.get,
  );
}
