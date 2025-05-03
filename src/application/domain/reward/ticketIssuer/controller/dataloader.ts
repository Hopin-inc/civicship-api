import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicketIssuer } from "@/types/graphql";
import TicketIssuerPresenter from "@/application/domain/reward/ticketIssuer/presenter";
import { ticketIssuerSelectDetail } from "@/application/domain/reward/ticketIssuer/data/type";

async function batchTicketIssuersById(
  issuer: PrismaClientIssuer,
  issuerIds: readonly string[],
): Promise<(GqlTicketIssuer | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.ticketIssuer.findMany({
      where: { id: { in: [...issuerIds] } },
      select: ticketIssuerSelectDetail,
    });
  });

  const map = new Map(records.map((record) => [record.id, TicketIssuerPresenter.get(record)])) as Map<string, GqlTicketIssuer | null>;

  return issuerIds.map((id) => map.get(id) ?? null);
}

export function createTicketIssuerLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlTicketIssuer | null>((keys) => batchTicketIssuersById(issuer, keys));
}
