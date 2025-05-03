import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlOpportunitySlot } from "@/types/graphql";
import { opportunitySlotSelectDetail, PrismaOpportunitySlotDetail } from "@/application/domain/experience/opportunitySlot/data/type";
import OpportunitySlotOutputFormat from "@/application/domain/experience/opportunitySlot/presenter";

async function batchOpportunitySlotsById(
  issuer: PrismaClientIssuer,
  slotIds: readonly string[],
): Promise<(GqlOpportunitySlot | null)[]> {
  const records = await issuer.internal((tx) =>
    tx.opportunitySlot.findMany({
      where: { id: { in: [...slotIds] } },
      select: opportunitySlotSelectDetail,
    }),
  ) as PrismaOpportunitySlotDetail[];

  const map = new Map(
    records.map((record) => [record.id, OpportunitySlotOutputFormat.get(record)]),
  ) as Map<string, GqlOpportunitySlot | null>;

  return slotIds.map((id) => map.get(id) ?? null);
}

export function createOpportunitySlotLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunitySlot | null>((keys) =>
    batchOpportunitySlotsById(issuer, keys),
  );
}
