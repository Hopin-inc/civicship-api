import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlOpportunityInvitation } from "@/types/graphql";
import OpportunityInvitationOutputFormat from "@/application/opportunityInvitation/presenter";
import { opportunityInvitationInclude } from "@/application/opportunityInvitation/infrastructure/type";

async function batchOpportunityInvitationsById(
  issuer: PrismaClientIssuer,
  ids: readonly string[],
): Promise<(GqlOpportunityInvitation | null)[]> {
  const records = await issuer.internal((tx) =>
    tx.opportunityInvitation.findMany({
      where: { id: { in: [...ids] } },
      include: opportunityInvitationInclude,
    }),
  );

  const map = new Map(
    records.map((record) => [record.id, OpportunityInvitationOutputFormat.get(record)]),
  );

  return ids.map((id) => map.get(id) ?? null);
}

export function createOpportunityInvitationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunityInvitation | null>((keys) =>
    batchOpportunityInvitationsById(issuer, keys),
  );
}
