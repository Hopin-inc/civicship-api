import { Prisma } from "@prisma/client";

export const ticketInclude = Prisma.validator<Prisma.TicketInclude>()({
  wallet: { include: { community: true } },
  utility: { include: { community: true } },
});

export type PrismaTicket = Prisma.TicketGetPayload<{
  include: typeof ticketInclude;
}>;
