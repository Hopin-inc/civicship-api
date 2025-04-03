import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/user/data/type";
import { participationInclude } from "@/application/domain/participation/data/type";

export const reservationInclude = Prisma.validator<Prisma.ReservationInclude>()({
  opportunitySlot: {
    include: {
      opportunity: {
        include: {
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
  createdByUser: { include: userInclude },
  participations: { include: participationInclude },
});

export type PrismaReservation = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;
