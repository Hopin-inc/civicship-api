import { Prisma } from "@prisma/client";
import {
  GqlCommunitySortInput,
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotFilterInput,
  GqlOpportunitySlotUpdateInput,
} from "@/types/graphql";
import { injectable } from "tsyringe";

@injectable()
export default class OpportunitySlotConverter {
  filter(filter?: GqlOpportunitySlotFilterInput): Prisma.OpportunitySlotWhereInput {
    return {
      AND: [filter?.opportunityId ? { opportunityId: filter.opportunityId } : {}],
    };
  }

  sort(sort?: GqlCommunitySortInput): Prisma.OpportunitySlotOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
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
