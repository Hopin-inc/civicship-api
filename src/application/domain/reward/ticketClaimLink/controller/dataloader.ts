import { PrismaClient } from "@prisma/client";
import { GqlTicketClaimLink } from "@/types/graphql";
import TicketClaimLinkPresenter from "@/application/domain/reward/ticketClaimLink/presenter";
import {
  PrismaTicketClaimLink,
  ticketClaimLinkInclude,
} from "@/application/domain/reward/ticketClaimLink/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createTicketClaimLinkLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaTicketClaimLink, GqlTicketClaimLink>(
    async (ids) =>
      prisma.ticketClaimLink.findMany({
        where: { id: { in: [...ids] } },
        include: ticketClaimLinkInclude,
      }),
    TicketClaimLinkPresenter.get,
  );
}
