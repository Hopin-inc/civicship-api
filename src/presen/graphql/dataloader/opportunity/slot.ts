import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import { GqlOpportunitySlot } from "@/types/graphql";
import { opportunitySlotInclude } from "@/infra/prisma/types/opportunity/slot";
import OpportunitySlotOutputFormat from "@/presen/graphql/dto/opportunity/slot/output";

async function batchOpportunitySlotsById(
  issuer: PrismaClientIssuer,
  slotIds: readonly string[],
): Promise<(GqlOpportunitySlot | null)[]> {
  const records = await issuer.internal((tx) =>
    tx.opportunitySlot.findMany({
      where: { id: { in: [...slotIds] } },
      include: opportunitySlotInclude,
    }),
  );

  const map = new Map(
    records.map((record) => [record.id, OpportunitySlotOutputFormat.get(record)]),
  );

  return slotIds.map((id) => map.get(id) ?? null);
}

export function createOpportunitySlotLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunitySlot | null>((keys) =>
    batchOpportunitySlotsById(issuer, keys),
  );
}
