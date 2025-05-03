import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicketStatusHistory } from "@/types/graphql";
import { 
  ticketStatusHistorySelectDetail,
  PrismaTicketStatusHistoryDetail
} from "@/application/domain/reward/ticket/statusHistory/data/type";
import TicketStatusHistoryPresenter from "@/application/domain/reward/ticket/statusHistory/presenter";

async function batchTicketStatusHistoriesById(
  issuer: PrismaClientIssuer,
  historyIds: readonly string[],
): Promise<(GqlTicketStatusHistory | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.ticketStatusHistory.findMany({
      where: { id: { in: [...historyIds] } },
      select: ticketStatusHistorySelectDetail,
    });
  }) as PrismaTicketStatusHistoryDetail[];

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
