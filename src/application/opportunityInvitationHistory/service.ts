import { IContext } from "@/types/server";
import { GqlQueryOpportunityInvitationHistoriesArgs } from "@/types/graphql";
import OpportunityInvitationHistoryInputFormat from "@/application/opportunityInvitationHistory/infrastructure/converter";
import OpportunityInvitationHistoryRepository from "@/application/opportunityInvitationHistory/infrastructure/repository";

export default class OpportunityInvitationHistoryService {
  static async fetchInvitationHistories(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryOpportunityInvitationHistoriesArgs,
    take: number,
  ) {
    const where = OpportunityInvitationHistoryInputFormat.filter(filter ?? {});
    const orderBy = OpportunityInvitationHistoryInputFormat.sort(sort ?? {});
    return OpportunityInvitationHistoryRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findInvitationHistory(ctx: IContext, id: string) {
    return OpportunityInvitationHistoryRepository.find(ctx, id);
  }
}
