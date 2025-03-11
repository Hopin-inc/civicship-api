import { IContext } from "@/types/server";
import { GqlQueryOpportunityInvitationHistoriesArgs } from "@/types/graphql";
import OpportunityInvitationHistoryConverter from "@/application/opportunityInvitation/invitationHistory/data/converter";
import OpportunityInvitationHistoryRepository from "@/application/opportunityInvitation/invitationHistory/data/repository";

export default class OpportunityInvitationHistoryService {
  static async fetchInvitationHistories(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryOpportunityInvitationHistoriesArgs,
    take: number,
  ) {
    const where = OpportunityInvitationHistoryConverter.filter(filter ?? {});
    const orderBy = OpportunityInvitationHistoryConverter.sort(sort ?? {});
    return OpportunityInvitationHistoryRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findInvitationHistory(ctx: IContext, id: string) {
    return OpportunityInvitationHistoryRepository.find(ctx, id);
  }
}
