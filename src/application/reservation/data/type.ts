import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/user/data/type";
import { participationInclude } from "@/application/participation/data/type";

export const reservationInclude = Prisma.validator<Prisma.ReservationInclude>()({
  opportunitySlot: true,
  createdByUser: { include: userInclude },
  participations: { include: participationInclude },
});

export type PrismaReservation = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;
