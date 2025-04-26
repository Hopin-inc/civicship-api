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

export type PrismaTicketIssuer = Prisma.TicketIssuerGetPayload<{
  include: typeof ticketIssuerInclude;
}>;
