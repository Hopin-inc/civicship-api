import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/user/data/type";
import { ticketInclude } from "@/application/ticket/data/type";

export const ticketStatusHistoryInclude = Prisma.validator<Prisma.TicketStatusHistoryInclude>()({
  ticket: { include: ticketInclude },
  createdByUser: { include: userInclude },
  transaction: true,
});

export type PrismaTicketStatusHistory = Prisma.TicketStatusHistoryGetPayload<{
  include: typeof ticketStatusHistoryInclude;
}>;
