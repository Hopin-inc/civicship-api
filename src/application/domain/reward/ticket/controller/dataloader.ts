import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicket } from "@/types/graphql";
import TicketPresenter from "@/application/domain/reward/ticket/presenter";
import { ticketSelectDetail } from "@/application/domain/reward/ticket/data/type";

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

  const map = new Map(records.map((record) => [record.id, TicketPresenter.get(record)])) as Map<string, GqlTicket | null>;

  return ticketIds.map((id) => map.get(id) ?? null);
}

export function createTicketLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlTicket | null>((keys) => batchTicketsById(issuer, keys));
}
