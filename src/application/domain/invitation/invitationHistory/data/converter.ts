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
        filter?.userId
          ? {
              participations: {
                some: {
                  userId: filter.userId,
                },
              },
            }
          : {},
      ],
    };
  }

  static sort(
    sort: GqlOpportunityInvitationHistorySortInput,
  ): Prisma.OpportunityInvitationHistoryOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? "desc" }];
  }
}
