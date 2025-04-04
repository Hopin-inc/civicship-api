import { Prisma } from "@prisma/client";
import {
  GqlCommunitySortInput,
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotFilterInput,
} from "@/types/graphql";

export default class OpportunitySlotConverter {
  static filter(filter?: GqlOpportunitySlotFilterInput): Prisma.OpportunitySlotWhereInput {
    return {
      AND: [filter?.opportunityId ? { opportunityId: filter.opportunityId } : {}],
    };
  }

  static sort(sort?: GqlCommunitySortInput): Prisma.OpportunitySlotOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static createMany(
    opportunityId: string,
    inputs: GqlOpportunitySlotCreateInput[],
  ): Prisma.OpportunitySlotCreateManyInput[] {
    return inputs.map((input) => ({
      opportunityId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    }));
  }
}
