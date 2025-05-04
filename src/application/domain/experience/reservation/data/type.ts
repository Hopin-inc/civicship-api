import { Prisma } from "@prisma/client";

export const reservationInclude = Prisma.validator<Prisma.ReservationInclude>()({
  opportunitySlot: true,
  participations: { include: { user: true } },
});

export const reservationSelectDetail = Prisma.validator<Prisma.ReservationSelect>()({
  id: true,
  opportunitySlotId: true,
  createdBy: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type PrismaReservation = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;

export type PrismaReservationDetail = Prisma.ReservationGetPayload<{
  select: typeof reservationSelectDetail;
}>;
