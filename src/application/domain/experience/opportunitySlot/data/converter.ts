import { Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotFilterInput,
  GqlOpportunitySlotSetHostingStatusInput,
  GqlOpportunitySlotSortInput,
  GqlOpportunitySlotUpdateInput,
} from "@/types/graphql";
import { injectable } from "tsyringe";

@injectable()
export default class OpportunitySlotConverter {
  filter(filter?: GqlOpportunitySlotFilterInput): Prisma.OpportunitySlotWhereInput {
    const slotConditions: Prisma.OpportunitySlotWhereInput[] = [];

    if (filter?.opportunityIds?.length) {
      slotConditions.push({ opportunityId: { in: filter.opportunityIds } });
    }

    if (filter?.ownerId) {
      slotConditions.push({ opportunity: { createdBy: filter.ownerId } });
    }

    if (filter?.hostingStatus) {
      if (Array.isArray(filter.hostingStatus) && filter.hostingStatus.length > 0) {
        slotConditions.push({ hostingStatus: { in: filter.hostingStatus } });
      } else if (!Array.isArray(filter.hostingStatus)) {
        slotConditions.push({ hostingStatus: filter.hostingStatus });
      }
    }

    const range = filter?.dateRange;
    if (range) {
      const startsAtCondition: Record<string, Date> = {};

      if (range.gte) startsAtCondition.gte = range.gte;
      if (range.lte) startsAtCondition.lte = range.lte;
      if (range.gt) startsAtCondition.gt = range.gt;
      if (range.lt) startsAtCondition.lt = range.lt;

      if (Object.keys(startsAtCondition).length > 0) {
        slotConditions.push({ startsAt: startsAtCondition });
      }
    }

    return {
      AND: slotConditions,
    };
  }

  sort(sort?: GqlOpportunitySlotSortInput): Prisma.OpportunitySlotOrderByWithRelationInput[] {
    return [{ startsAt: sort?.startsAt ?? Prisma.SortOrder.desc }];
  }

  create(
    opportunityId: string,
    input: GqlOpportunitySlotCreateInput,
  ): Prisma.OpportunitySlotCreateInput {
    return {
      opportunity: { connect: { id: opportunityId } },
      capacity: input.capacity,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    };
  }

  createMany(
    opportunityId: string,
    inputs: GqlOpportunitySlotCreateInput[],
  ): Prisma.OpportunitySlotCreateManyInput[] {
    return inputs.map((input) => ({
      opportunityId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    }));
  }

  setStatus(input: GqlOpportunitySlotSetHostingStatusInput): Prisma.OpportunitySlotUpdateInput {
    const { status, capacity, startsAt, endsAt } = input;

    return {
      hostingStatus: status,
      ...(capacity !== undefined ? { capacity } : {}),
      ...(startsAt !== undefined ? { startsAt } : {}),
      ...(endsAt !== undefined ? { endsAt } : {}),
    };
  }

  update(input: GqlOpportunitySlotUpdateInput): Prisma.OpportunitySlotUpdateInput {
    const { startsAt, endsAt } = input;
    return {
      startsAt: startsAt,
      endsAt: endsAt,
    };
  }
}
