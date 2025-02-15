import { IContext } from "@/types/server";
import { GqlQueryOpportunityInvitationHistoriesArgs } from "@/types/graphql";
import OpportunityInvitationHistoryInputFormat from "@/domains/opportunity/invitation/history/presenter/input";
import OpportunityInvitationHistoryRepository from "@/domains/opportunity/invitation/history/repository";

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
