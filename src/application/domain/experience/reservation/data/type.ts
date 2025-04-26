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

export type PrismaReservation = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;
