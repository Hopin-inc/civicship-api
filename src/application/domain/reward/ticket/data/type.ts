import { Prisma } from "@prisma/client";
import { ticketClaimLinkInclude } from "@/application/domain/reward/ticketClaimLink/data/type";

export const ticketInclude = Prisma.validator<Prisma.TicketInclude>()({
  wallet: { include: { community: true } },
  utility: { include: { community: true } },
  claimLink: { include: ticketClaimLinkInclude },
});

export const ticketSelectDetail = Prisma.validator<Prisma.TicketSelect>()({
  id: true,
  walletId: true,
  utilityId: true,
  claimLinkId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type PrismaTicket = Prisma.TicketGetPayload<{
  include: typeof ticketInclude;
}>;

export type PrismaTicketDetail = Prisma.TicketGetPayload<{
  select: typeof ticketSelectDetail;
}>;
