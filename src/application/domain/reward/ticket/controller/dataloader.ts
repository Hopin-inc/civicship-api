import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicket } from "@/types/graphql";
import TicketPresenter from "@/application/domain/reward/ticket/presenter";
import {
  PrismaTicketDetail,
  ticketSelectDetail,
} from "@/application/domain/reward/ticket/data/type";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchTicketsById(
  issuer: PrismaClientIssuer,
  ticketIds: readonly string[],
): Promise<(GqlTicket | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.ticket.findMany({
      where: { id: { in: [...ticketIds] } },
      select: ticketSelectDetail,
    });
  });

  const map = new Map(records.map((record) => [record.id, TicketPresenter.get(record)])) as Map<
    string,
    GqlTicket | null
  >;

  return ticketIds.map((id) => map.get(id) ?? null);
}

export function createTicketLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlTicket | null>((keys) => batchTicketsById(issuer, keys));
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
