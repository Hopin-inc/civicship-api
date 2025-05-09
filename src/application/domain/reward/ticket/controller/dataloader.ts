import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createTicketLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaTicketDetail, GqlTicket>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.ticket.findMany({
          where: { id: { in: [...ids] } },
          select: ticketSelectDetail,
        }),
      ),
    TicketPresenter.get,
  );
}

export function createTicketsByUtilityLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"utilityId", PrismaTicketDetail, GqlTicket>(
    "utilityId",
    async (utilityIds) => {
      return issuer.internal((tx) =>
        tx.ticket.findMany({
          where: {
            utilityId: { in: [...utilityIds] },
          },
        }),
      );
    },
    TicketPresenter.get,
  );
}

export function createTicketsByWalletLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"walletId", PrismaTicketDetail, GqlTicket>(
    "walletId",
    async (walletIds) => {
      return issuer.internal((tx) =>
        tx.ticket.findMany({
          where: { walletId: { in: [...walletIds] } },
        }),
      );
    },
    TicketPresenter.get,
  );
}

export function createTicketsByTicketClaimLinkLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"claimLinkId", PrismaTicketDetail, GqlTicket>(
    "claimLinkId",
    async (ticketClaimLinkIds) => {
      return issuer.internal((tx) =>
        tx.ticket.findMany({
          where: {
            claimLinkId: { in: [...ticketClaimLinkIds] },
          },
        }),
      );
    },
    TicketPresenter.get,
  );
}
