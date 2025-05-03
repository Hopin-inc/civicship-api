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
  issuerId: true,
  code: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  issuer: { 
    select: { 
      id: true,
      utilityId: true,
      ownerId: true,
      utility: { select: { id: true, communityId: true } },
      owner: { select: { id: true } }
    } 
  },
});

export type PrismaTicketClaimLink = Prisma.TicketClaimLinkGetPayload<{
  include: typeof ticketClaimLinkInclude;
}>;

export type PrismaTicketClaimLinkDetail = Prisma.TicketClaimLinkGetPayload<{
  select: typeof ticketClaimLinkSelectDetail;
}>;
