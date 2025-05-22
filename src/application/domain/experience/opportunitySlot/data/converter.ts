import { Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotFilterInput,
  GqlOpportunitySlotSortInput,
  GqlOpportunitySlotUpdateInput,
} from "@/types/graphql";
import { injectable } from "tsyringe";

@injectable()
export default class OpportunitySlotConverter {
  filter(filter?: GqlOpportunitySlotFilterInput): Prisma.OpportunitySlotWhereInput {
    const slotConditions: Prisma.OpportunitySlotWhereInput[] = [];

    if (filter?.opportunityId) {
      slotConditions.push({ opportunityId: filter.opportunityId });
    }

    if (filter?.ownerId) {
      slotConditions.push({ opportunity: { createdBy: filter.ownerId } });
    }

    if (filter?.hostingStatus) {
      slotConditions.push({ hostingStatus: filter.hostingStatus });
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

  setStatus(input: GqlOpportunitySlotUpdateInput): Prisma.OpportunitySlotUpdateInput {
    const { startsAt, endsAt } = input;
    return {
      startsAt: startsAt,
      endsAt: endsAt,
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
