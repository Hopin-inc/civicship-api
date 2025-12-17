import { PrismaClient } from "@prisma/client";
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

export function createOpportunitySlotLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaOpportunitySlotDetail, GqlOpportunitySlot>(
    async (ids) =>
      prisma.opportunitySlot.findMany({
        where: { id: { in: [...ids] } },
        select: opportunitySlotSelectDetail,
      }),
    OpportunitySlotPresenter.get,
  );
}

export function createSlotsByOpportunityLoader(prisma: PrismaClient) {
  return createFilterSortAwareHasManyLoaderByKey<
    "opportunityId",
    GqlOpportunitySlotFilterInput,
    GqlOpportunitySlotSortInput,
    PrismaOpportunitySlotDetail,
    GqlOpportunitySlot
  >(
    "opportunityId",
    async (opportunityId, filter, sort) => {
      const opportunity = await prisma.opportunity.findUnique({
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
      });
      return opportunity?.slots ?? [];
    },
    (slot) => OpportunitySlotPresenter.get(slot)
  );
}
