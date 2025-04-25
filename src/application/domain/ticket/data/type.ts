import { Prisma } from "@prisma/client";
import { ticketClaimLinkInclude } from "@/application/domain/ticketClaimLink/data/type";

export const ticketInclude = Prisma.validator<Prisma.TicketInclude>()({
  wallet: { include: { community: true } },
  utility: { include: { community: true } },
  claimLink: { include: ticketClaimLinkInclude },
});

export type PrismaTicket = Prisma.TicketGetPayload<{
  include: typeof ticketInclude;
}>;
