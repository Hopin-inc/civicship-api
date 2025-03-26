import { Prisma } from "@prisma/client";
import {
  GqlOpportunityInvitationFilterInput,
  GqlOpportunityInvitationSortInput,
  GqlOpportunityInvitationCreateInput,
} from "@/types/graphql";

export default class OpportunityInvitationConverter {
  static filter(
    filter: GqlOpportunityInvitationFilterInput,
  ): Prisma.OpportunityInvitationWhereInput {
    return {
      AND: [
        filter?.createdByUserId ? { createdBy: filter.createdByUserId } : {},
        filter?.opportunityId ? { opportunityId: filter.opportunityId } : {},
        filter?.isValid ? { isValid: filter.isValid } : {},
      ],
    };
  }

  static sort(
    sort: GqlOpportunityInvitationSortInput,
  ): Prisma.OpportunityInvitationOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? "desc" }];
  }

  static create(
    userId: string,
    input: GqlOpportunityInvitationCreateInput,
  ): Prisma.OpportunityInvitationCreateInput {
    return {
      code: input.code,
      opportunity: { connect: { id: input.opportunityId } },
      createdByUser: { connect: { id: userId } },
    };
  }
}
