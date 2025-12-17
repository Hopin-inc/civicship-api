import { PrismaClient } from "@prisma/client";
import { GqlTicket } from "@/types/graphql";
import TicketPresenter from "@/application/domain/reward/ticket/presenter";
import {
  PrismaTicketDetail,
  ticketSelectDetail,
} from "@/application/domain/reward/ticket/data/type";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createTicketLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaTicketDetail, GqlTicket>(
    async (ids) =>
      prisma.ticket.findMany({
        where: { id: { in: [...ids] } },
        select: ticketSelectDetail,
      }),
    TicketPresenter.get,
  );
}

export function createTicketsByUtilityLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"utilityId", PrismaTicketDetail, GqlTicket>(
    "utilityId",
    async (utilityIds) => {
      return prisma.ticket.findMany({
        where: {
          utilityId: { in: [...utilityIds] },
        },
      });
    },
    TicketPresenter.get,
  );
}

export function createTicketsByWalletLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"walletId", PrismaTicketDetail, GqlTicket>(
    "walletId",
    async (walletIds) => {
      return prisma.ticket.findMany({
        where: { walletId: { in: [...walletIds] } },
      });
    },
    TicketPresenter.get,
  );
}

export function createTicketsByTicketClaimLinkLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"claimLinkId", PrismaTicketDetail, GqlTicket>(
    "claimLinkId",
    async (ticketClaimLinkIds) => {
      return prisma.ticket.findMany({
        where: {
          claimLinkId: { in: [...ticketClaimLinkIds] },
        },
      });
    },
    TicketPresenter.get,
  );
}
