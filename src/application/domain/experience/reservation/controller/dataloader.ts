import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import {
  PrismaReservationDetail,
  reservationSelectDetail,
} from "@/application/domain/experience/reservation/data/type";
import ReservationPresenter from "@/application/domain/experience/reservation/presenter";
import { GqlReservation } from "@/types/graphql";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchReservationsById(
  issuer: PrismaClientIssuer,
  ids: readonly string[],
): Promise<(GqlReservation | null)[]> {
  const records = await issuer.internal((tx) =>
    tx.reservation.findMany({
      where: { id: { in: [...ids] } },
      select: reservationSelectDetail,
    }),
  );

  const map = new Map(records.map((r) => [r.id, ReservationPresenter.get(r)]));
  return ids.map((id) => map.get(id) ?? null);
}

export function createReservationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlReservation | null>((keys) =>
    batchReservationsById(issuer, keys),
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
