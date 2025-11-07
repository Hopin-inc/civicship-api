import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import { GqlTicketStatusHistory } from "@/types/graphql";
import {
  ticketStatusHistorySelectDetail,
  PrismaTicketStatusHistoryDetail,
} from "@/application/domain/reward/ticket/statusHistory/data/type";
import TicketStatusHistoryPresenter from "@/application/domain/reward/ticket/statusHistory/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchTicketStatusHistoriesById(
  prisma: PrismaClient,
  historyIds: readonly string[],
): Promise<(GqlTicketStatusHistory | null)[]> {
  const records = (await prisma.ticketStatusHistory.findMany({
    where: { id: { in: [...historyIds] } },
    select: ticketStatusHistorySelectDetail,
  })) as PrismaTicketStatusHistoryDetail[];

  const map = new Map(
    records.map((record) => [record.id, TicketStatusHistoryPresenter.get(record)])
  );

  return historyIds.map((id) => map.get(id) ?? null);
}

export function createTicketStatusHistoryLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlTicketStatusHistory | null>((keys) =>
    batchTicketStatusHistoriesById(prisma, keys)
  );
}

export function createTicketStatusHistoriesByTicketLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<
    "ticketId",
    PrismaTicketStatusHistoryDetail,
    GqlTicketStatusHistory
  >(
    "ticketId",
    async (ticketIds) => {
      return prisma.ticketStatusHistory.findMany({
        where: { ticketId: { in: [...ticketIds] } },
        select: ticketStatusHistorySelectDetail,
      });
    },
    TicketStatusHistoryPresenter.get,
  );
}

export function createTicketStatusHistoriesByTransactionLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<
    "transactionId",
    PrismaTicketStatusHistoryDetail,
    GqlTicketStatusHistory
  >(
    "transactionId",
    async (transactionIds) => {
      return prisma.ticketStatusHistory.findMany({
        where: {
          transactionId: { in: [...transactionIds] },
        },
        select: ticketStatusHistorySelectDetail,
      });
    },
    TicketStatusHistoryPresenter.get,
  );
}

export function createTicketStatusHistoriesByParticipationLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<
    "participationId",
    PrismaTicketStatusHistoryDetail,
    GqlTicketStatusHistory
  >(
    "participationId",
    async (participationIds) => {
      return prisma.ticketStatusHistory.findMany({
        where: { participationId: { in: [...participationIds] } },
        select: ticketStatusHistorySelectDetail,
      });
    },
    TicketStatusHistoryPresenter.get,
  );
}
