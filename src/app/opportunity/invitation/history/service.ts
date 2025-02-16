import { IContext } from "@/types/server";
import { GqlQueryOpportunityInvitationHistoriesArgs } from "@/types/graphql";
import OpportunityInvitationHistoryInputFormat from "@/presen/graphql/dto/opportunity/invitation/history/input";
import OpportunityInvitationHistoryRepository from "@/infra/repositories/opportunity/invitation/history";

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
