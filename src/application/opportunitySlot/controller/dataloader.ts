import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlOpportunitySlot } from "@/types/graphql";
import { opportunitySlotInclude } from "@/application/opportunitySlot/data/type";
import OpportunitySlotOutputFormat from "@/application/opportunitySlot/presenter";

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
