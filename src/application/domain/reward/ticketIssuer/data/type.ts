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
  qtyToBeIssued: true,

  utilityId: true,
  ownerId: true,

  claimLink: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaTicketIssuer = Prisma.TicketIssuerGetPayload<{
  include: typeof ticketIssuerInclude;
}>;

export type PrismaTicketIssuerDetail = Prisma.TicketIssuerGetPayload<{
  select: typeof ticketIssuerSelectDetail;
}>;
