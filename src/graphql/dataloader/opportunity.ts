import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/prisma/client";
import { GqlOpportunity } from "@/types/graphql";
import OpportunityOutputFormat from "@/domains/opportunity/presenter/output";
import { opportunityInclude } from "@/domains/opportunity/type";

async function batchOpportunitiesById(
  issuer: PrismaClientIssuer,
  opportunityIds: readonly string[],
): Promise<(GqlOpportunity | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.opportunity.findMany({
      where: { id: { in: [...opportunityIds] } },
      include: opportunityInclude,
    });
  });

  const oppMap = new Map(records.map((record) => [record.id, OpportunityOutputFormat.get(record)]));

  return opportunityIds.map((id) => oppMap.get(id) ?? null);
}

export function createOpportunityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunity | null>((keys) =>
    batchOpportunitiesById(issuer, keys),
  );
}
