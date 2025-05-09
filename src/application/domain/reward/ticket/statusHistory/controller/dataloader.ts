import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicketStatusHistory } from "@/types/graphql";
import {
  ticketStatusHistorySelectDetail,
  PrismaTicketStatusHistoryDetail,
} from "@/application/domain/reward/ticket/statusHistory/data/type";
import TicketStatusHistoryPresenter from "@/application/domain/reward/ticket/statusHistory/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchTicketStatusHistoriesById(
  issuer: PrismaClientIssuer,
  historyIds: readonly string[],
): Promise<(GqlTicketStatusHistory | null)[]> {
  const records = (await issuer.internal(async (tx) => {
    return tx.ticketStatusHistory.findMany({
      where: { id: { in: [...historyIds] } },
      select: ticketStatusHistorySelectDetail,
    });
  })) as PrismaTicketStatusHistoryDetail[];

  const map = new Map(
    records.map((record) => [record.id, TicketStatusHistoryPresenter.get(record)]),
  );

  return historyIds.map((id) => map.get(id) ?? null);
}

export function createTicketStatusHistoryLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlTicketStatusHistory | null>((keys) =>
    batchTicketStatusHistoriesById(issuer, keys),
  );
}

export function createTicketStatusHistoriesByTicketLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<
    "ticketId",
    PrismaTicketStatusHistoryDetail,
    GqlTicketStatusHistory
  >(
    "ticketId",
    async (ticketIds) => {
      return issuer.internal((tx) =>
        tx.ticketStatusHistory.findMany({
          where: { ticketId: { in: [...ticketIds] } },
        }),
      );
    },
    TicketStatusHistoryPresenter.get,
  );
}
