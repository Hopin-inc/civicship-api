import { Prisma } from "@prisma/client";

export const ticketClaimLinkInclude = Prisma.validator<Prisma.TicketClaimLinkInclude>()({
  issuer: { include: { utility: true } },
});

export const ticketClaimLinkSelectDetail = Prisma.validator<Prisma.TicketClaimLinkSelect>()({
  id: true,
  qty: true,
  status: true,

  issuerId: true,
  tickets: { select: { id: true, status: true, reason: true } },

  claimedAt: true,
  createdAt: true,
});

export type PrismaTicketClaimLink = Prisma.TicketClaimLinkGetPayload<{
  include: typeof ticketClaimLinkInclude;
}>;

export type PrismaTicketClaimLinkDetail = Prisma.TicketClaimLinkGetPayload<{
  select: typeof ticketClaimLinkSelectDetail;
}>;
