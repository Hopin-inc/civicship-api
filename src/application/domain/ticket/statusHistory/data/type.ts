import { Prisma } from "@prisma/client";

export const ticketStatusHistoryInclude = Prisma.validator<Prisma.TicketStatusHistoryInclude>()({
  ticket: true,
  createdByUser: true,
  transaction: true,
});

export type PrismaTicketStatusHistory = Prisma.TicketStatusHistoryGetPayload<{
  include: typeof ticketStatusHistoryInclude;
}>;
