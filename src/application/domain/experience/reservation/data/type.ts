import { Prisma } from "@prisma/client";

export const reservationInclude = Prisma.validator<Prisma.ReservationInclude>()({
  opportunitySlot: {
    include: {
      opportunity: {
        include: { place: true, images: true, createdByUser: { include: { image: true } } },
      },
    },
  },
  participations: { include: { user: true } },
});

export const reservationSelectDetail = Prisma.validator<Prisma.ReservationSelect>()({
  id: true,
  status: true,

  opportunitySlotId: true,
  createdBy: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaReservation = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;

export type PrismaReservationDetail = Prisma.ReservationGetPayload<{
  select: typeof reservationSelectDetail;
}>;
