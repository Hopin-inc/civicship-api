import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlOpportunitySlot } from "@/types/graphql";
import {
  opportunitySlotSelectDetail,
  PrismaOpportunitySlotDetail,
} from "@/application/domain/experience/opportunitySlot/data/type";
import OpportunitySlotPresenter from "@/application/domain/experience/opportunitySlot/presenter";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createOpportunitySlotLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaOpportunitySlotDetail, GqlOpportunitySlot>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.opportunitySlot.findMany({
          where: { id: { in: [...ids] } },
          select: opportunitySlotSelectDetail,
        }),
      ),
    OpportunitySlotPresenter.get,
  );
}

export function createSlotsByOpportunityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunitySlot[]>(async (opportunityIds) => {
    const opportunities = await issuer.internal((tx) =>
      tx.opportunity.findMany({
        where: { id: { in: [...opportunityIds] } },
        include: {
          slots: { include: { remainingCapacityView: true, slotEvaluationProgress: true } },
        },
      }),
    );

    const map = new Map<string, GqlOpportunitySlot[]>();
    for (const o of opportunities) {
      map.set(o.id, o.slots.map(OpportunitySlotPresenter.get));
    }

    return opportunityIds.map((id) => map.get(id) ?? []);
  });
}
