import { Prisma } from "@prisma/client";
import { ticketInclude } from "@/application/domain/ticket/data/type";

export const ticketStatusHistoryInclude = Prisma.validator<Prisma.TicketStatusHistoryInclude>()({
  ticket: { include: ticketInclude },
  createdByUser: true,
  transaction: true,
});

export type PrismaTicketStatusHistory = Prisma.TicketStatusHistoryGetPayload<{
  include: typeof ticketStatusHistoryInclude;
}>;
