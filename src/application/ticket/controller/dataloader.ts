import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicket } from "@/types/graphql";
import TicketPresenter from "@/application/ticket/presenter";
import { ticketInclude } from "@/application/ticket/data/type";

async function batchTicketsById(
  issuer: PrismaClientIssuer,
  ticketIds: readonly string[],
): Promise<(GqlTicket | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.ticket.findMany({
      where: { id: { in: [...ticketIds] } },
      include: ticketInclude,
    });
  });

  const map = new Map(records.map((record) => [record.id, TicketPresenter.get(record)]));

  return ticketIds.map((id) => map.get(id) ?? null);
}

export function createTicketLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlTicket | null>((keys) => batchTicketsById(issuer, keys));
}
