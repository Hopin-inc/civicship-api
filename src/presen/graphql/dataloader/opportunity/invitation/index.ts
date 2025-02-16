import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import { GqlOpportunityInvitation } from "@/types/graphql";
import OpportunityInvitationOutputFormat from "@/presen/graphql/dto/opportunity/invitation/output";
import { opportunityInvitationInclude } from "@/infra/prisma/types/opportunity/invitation";

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
