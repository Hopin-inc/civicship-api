import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/prisma/client";
import { GqlOpportunityInvitationHistory } from "@/types/graphql";
import { invitationHistoryInclude } from "@/domains/opportunity/invitation/history/type";
import OpportunityInvitationHistoryOutputFormat from "@/domains/opportunity/invitation/history/presenter/output";

async function batchInvitationHistoriesById(
  issuer: PrismaClientIssuer,
  ids: readonly string[],
): Promise<(GqlOpportunityInvitationHistory | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.opportunityInvitationHistory.findMany({
      where: { id: { in: [...ids] } },
      include: invitationHistoryInclude,
    });
  });

  const map = new Map(
    records.map((record) => [record.id, OpportunityInvitationHistoryOutputFormat.get(record)]),
  );

  return ids.map((id) => map.get(id) ?? null);
}

export function createOpportunityInvitationHistoryLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunityInvitationHistory | null>((keys) =>
    batchInvitationHistoriesById(issuer, keys),
  );
}
