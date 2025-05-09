import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlOpportunitySlot } from "@/types/graphql";
import {
  opportunitySlotSelectDetail,
  PrismaOpportunitySlotDetail,
} from "@/application/domain/experience/opportunitySlot/data/type";
import OpportunitySlotPresenter from "@/application/domain/experience/opportunitySlot/presenter";

async function batchOpportunitySlotsById(
  issuer: PrismaClientIssuer,
  slotIds: readonly string[],
): Promise<(GqlOpportunitySlot | null)[]> {
  const records = (await issuer.internal((tx) =>
    tx.opportunitySlot.findMany({
      where: { id: { in: [...slotIds] } },
      select: opportunitySlotSelectDetail,
    }),
  )) as PrismaOpportunitySlotDetail[];

  const map = new Map(
    records.map((record) => [record.id, OpportunitySlotPresenter.get(record)]),
  ) as Map<string, GqlOpportunitySlot | null>;

  return slotIds.map((id) => map.get(id) ?? null);
}

export function createOpportunitySlotLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunitySlot | null>((keys) =>
    batchOpportunitySlotsById(issuer, keys),
  );
}

export function createSlotsByOpportunityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunitySlot[]>(async (opportunityIds) => {
    const opportunities = await issuer.internal((tx) =>
      tx.opportunity.findMany({
        where: { id: { in: [...opportunityIds] } },
        include: { slots: { include: { remainingCapacityView: true } } },
      }),
    );

    const map = new Map<string, GqlOpportunitySlot[]>();
    for (const o of opportunities) {
      map.set(o.id, o.slots.map(OpportunitySlotPresenter.get));
    }

    return opportunityIds.map((id) => map.get(id) ?? []);
  });
}
