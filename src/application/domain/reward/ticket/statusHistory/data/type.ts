import { Prisma } from "@prisma/client";

export const ticketStatusHistoryInclude = Prisma.validator<Prisma.TicketStatusHistoryInclude>()({
  ticket: true,
  createdByUser: true,
  transaction: true,
});

export const ticketStatusHistorySelectDetail = Prisma.validator<Prisma.TicketStatusHistorySelect>()(
  {
    id: true,
    status: true,
    reason: true,
    ticketId: true,
    createdBy: true,
    transactionId: true,
    participationId: true,
    createdAt: true,
    updatedAt: true,
  },
);

export type PrismaTicketStatusHistory = Prisma.TicketStatusHistoryGetPayload<{
  include: typeof ticketStatusHistoryInclude;
}>;

export type PrismaTicketStatusHistoryDetail = Prisma.TicketStatusHistoryGetPayload<{
  select: typeof ticketStatusHistorySelectDetail;
}>;
