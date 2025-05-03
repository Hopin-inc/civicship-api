import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/account/user/data/type";
import { participationInclude } from "@/application/domain/experience/participation/data/type";

export const reservationInclude = Prisma.validator<Prisma.ReservationInclude>()({
  opportunitySlot: {
    include: {
      opportunity: {
        include: {
          images: true,
          createdByUser: { include: userInclude },
          place: true,
          requiredUtilities: {
            include: {
              community: true,
            },
          },
        },
      },
      remainingCapacityView: true,
    },
  },
  createdByUser: true,
  participations: { include: participationInclude },
});

export const reservationSelectDetail = Prisma.validator<Prisma.ReservationSelect>()({
  id: true,
  opportunitySlotId: true,
  createdByUserId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  opportunitySlot: { 
    select: { 
      id: true,
      opportunityId: true,
      startAt: true,
      endAt: true,
      capacity: true,
      opportunity: { 
        select: { 
          id: true,
          name: true,
          images: { select: { id: true, url: true } }
        } 
      },
      remainingCapacityView: { select: { id: true, remainingCapacity: true } }
    } 
  },
  createdByUser: { select: { id: true } },
  participations: { select: { id: true } },
});

export type PrismaReservation = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;

export type PrismaReservationDetail = Prisma.ReservationGetPayload<{
  select: typeof reservationSelectDetail;
}>;
