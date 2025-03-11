import { Prisma } from "@prisma/client";
import {
  GqlCommunitySortInput,
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotFilterInput,
  GqlOpportunitySlotUpdateInput,
} from "@/types/graphql";

export default class OpportunitySlotInputFormat {
  static filter(filter?: GqlOpportunitySlotFilterInput): Prisma.OpportunitySlotWhereInput {
    return {
      AND: [filter?.opportunityId ? { opportunityId: filter.opportunityId } : {}],
    };
  }

  static sort(sort?: GqlCommunitySortInput): Prisma.OpportunitySlotOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static create(
    opportunityId: string,
    input: GqlOpportunitySlotCreateInput,
  ): Prisma.OpportunitySlotCreateInput {
    return {
      opportunity: { connect: { id: opportunityId } },
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    };
  }

  static update(input: GqlOpportunitySlotUpdateInput): Prisma.OpportunitySlotUpdateInput {
    const { startsAt, endsAt } = input;
    return {
      startsAt: startsAt ?? undefined,
      endsAt: endsAt ?? undefined,
    };
  }
}
