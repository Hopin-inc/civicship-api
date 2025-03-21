import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { reservationInclude } from "@/application/reservation/data/type";
import ReservationPresenter from "@/application/reservation/presenter";
import { GqlReservation } from "@/types/graphql";

async function batchReservationsById(
  issuer: PrismaClientIssuer,
  ids: readonly string[],
): Promise<(GqlReservation | null)[]> {
  const records = await issuer.internal((tx) =>
    tx.reservation.findMany({
      where: { id: { in: [...ids] } },
      include: reservationInclude,
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
