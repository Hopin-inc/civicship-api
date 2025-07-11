import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import {
  GqlOpportunitySlot,
  GqlOpportunitySlotFilterInput,
  GqlOpportunitySlotSortInput,
} from "@/types/graphql";
import {
  opportunitySlotSelectDetail,
  PrismaOpportunitySlotDetail,
} from "@/application/domain/experience/opportunitySlot/data/type";
import OpportunitySlotPresenter from "@/application/domain/experience/opportunitySlot/presenter";
import {
  createFilterSortAwareHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

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
  return createFilterSortAwareHasManyLoaderByKey<
    "opportunityId",
    GqlOpportunitySlotFilterInput,
    GqlOpportunitySlotSortInput,
    PrismaOpportunitySlotDetail,
    GqlOpportunitySlot
  >(
    "opportunityId",
    async (opportunityId, filter, sort) => {
      const opportunity = await issuer.internal((tx) =>
        tx.opportunity.findUnique({
          where: { id: opportunityId },
          include: {
            slots: {
              where: {
                ...filter,
                hostingStatus: filter.hostingStatus ? { in: filter.hostingStatus } : undefined,
              },
              orderBy: sort,
              include: { remainingCapacityView: true },
            },
          },
        }),
      );
      return opportunity?.slots ?? [];
    },
    (slot) => OpportunitySlotPresenter.get(slot),
  );
}
