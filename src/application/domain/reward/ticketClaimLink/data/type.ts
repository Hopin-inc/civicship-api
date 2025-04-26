import { Prisma } from "@prisma/client";

export const ticketClaimLinkInclude = Prisma.validator<Prisma.TicketClaimLinkInclude>()({
  issuer: {
    include: {
      utility: { include: { community: true } },
      owner: true,
    },
  },
});

export type PrismaTicketClaimLink = Prisma.TicketClaimLinkGetPayload<{
  include: typeof ticketClaimLinkInclude;
}>;
