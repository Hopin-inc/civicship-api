import { Prisma } from "@prisma/client";

export const ticketClaimLinkInclude = Prisma.validator<Prisma.TicketClaimLinkInclude>()({
  issuer: {
    include: {
      utility: { include: { community: true } },
      owner: true,
    },
  },
});

export const ticketClaimLinkSelectDetail = Prisma.validator<Prisma.TicketClaimLinkSelect>()({
  id: true,
  qty: true,
  status: true,
  issuerId: true,
  claimedAt: true,
  tickets: { select: { id: true } },
  createdAt: true,
});

export type PrismaTicketClaimLink = Prisma.TicketClaimLinkGetPayload<{
  include: typeof ticketClaimLinkInclude;
}>;

export type PrismaTicketClaimLinkDetail = Prisma.TicketClaimLinkGetPayload<{
  select: typeof ticketClaimLinkSelectDetail;
}>;
