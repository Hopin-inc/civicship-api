import { Prisma } from "@prisma/client";
import {
  GqlOpportunityInvitationHistoryFilterInput,
  GqlOpportunityInvitationHistorySortInput,
} from "@/types/graphql";

export default class OpportunityInvitationHistoryConverter {
  static filter(
    filter: GqlOpportunityInvitationHistoryFilterInput,
  ): Prisma.OpportunityInvitationHistoryWhereInput {
    return {
      AND: [
        filter?.invitationId ? { invitationId: filter.invitationId } : {},
        filter?.invitedUserId ? { invitedUserId: filter.invitedUserId } : {},
      ],
    };
  }

  static sort(
    sort: GqlOpportunityInvitationHistorySortInput,
  ): Prisma.OpportunityInvitationHistoryOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? "desc" }];
  }
}
