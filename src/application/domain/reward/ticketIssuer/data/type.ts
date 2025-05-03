import { Prisma } from "@prisma/client";

export const ticketIssuerInclude = Prisma.validator<Prisma.TicketIssuerInclude>()({
  claimLink: {
    include: {
      issuer: {
        include: {
          utility: { include: { community: true } },
          owner: true,
        },
      },
    },
  },
  utility: { include: { community: true } },
  owner: true,
});

export const ticketIssuerSelectDetail = Prisma.validator<Prisma.TicketIssuerSelect>()({
  id: true,
  utilityId: true,
  ownerId: true,
  qtyToBeIssued: true,
  createdAt: true,
  updatedAt: true,
  claimLinkId: true,
  utility: { select: { id: true, communityId: true } },
  owner: { select: { id: true } },
  claimLink: { select: { id: true } },
});

export type PrismaTicketIssuer = Prisma.TicketIssuerGetPayload<{
  include: typeof ticketIssuerInclude;
}>;

export type PrismaTicketIssuerDetail = Prisma.TicketIssuerGetPayload<{
  select: typeof ticketIssuerSelectDetail;
}>;
