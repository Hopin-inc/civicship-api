import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicketClaimLink } from "@/types/graphql";
import TicketClaimLinkPresenter from "@/application/domain/reward/ticketClaimLink/presenter";
import { ticketClaimLinkInclude } from "@/application/domain/reward/ticketClaimLink/data/type";

async function batchTicketClaimLinksById(
  issuer: PrismaClientIssuer,
  claimLinkIds: readonly string[],
): Promise<(GqlTicketClaimLink | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.ticketClaimLink.findMany({
      where: { id: { in: [...claimLinkIds] } },
      include: ticketClaimLinkInclude,
    });
  });

  const map = new Map(
    records.map((record) => [record.id, TicketClaimLinkPresenter.get(record)]),
  ) as Map<string, GqlTicketClaimLink | null>;

  return claimLinkIds.map((id) => map.get(id) ?? null);
}

export function createTicketClaimLinkLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlTicketClaimLink | null>((keys) =>
    batchTicketClaimLinksById(issuer, keys),
  );
}
