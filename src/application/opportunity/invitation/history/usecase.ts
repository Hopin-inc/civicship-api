import {
  GqlQueryOpportunityInvitationHistoriesArgs,
  GqlQueryOpportunityInvitationHistoryArgs,
  GqlOpportunityInvitationHistoriesConnection,
  GqlOpportunityInvitationHistory,
  GqlOpportunityInvitation,
  GqlOpportunityInvitationHistoriesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityInvitationHistoryService from "@/application/opportunity/invitation/history/service";
import OpportunityInvitationHistoryOutputFormat from "@/presentation/graphql/dto/opportunity/invitation/history/output";
import OpportunityInvitationHistoryUtils from "@/application/opportunity/invitation/history/utils";

export default class OpportunityInvitationHistoryUseCase {
  static async visitorBrowseOpportunityInvitationHistories(
    { filter, sort, cursor, first }: GqlQueryOpportunityInvitationHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationHistoriesConnection> {
    return OpportunityInvitationHistoryUtils.fetchInvitationHistoriesCommon(ctx, {
      filter,
      sort,
      cursor,
      first,
    });
  }

  static async visitorBrowseInvitationHistories(
    parent: GqlOpportunityInvitation,
    { filter, sort, cursor, first }: GqlOpportunityInvitationHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationHistoriesConnection> {
    return OpportunityInvitationHistoryUtils.fetchInvitationHistoriesCommon(ctx, {
      filter: {
        ...filter,
        invitationId: parent.id,
      },
      sort,
      cursor,
      first,
    });
  }

  static async visitorViewOpportunityInvitationHistory(
    { id }: GqlQueryOpportunityInvitationHistoryArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationHistory | null> {
    const history = await OpportunityInvitationHistoryService.findInvitationHistory(ctx, id);
    if (!history) return null;
    return OpportunityInvitationHistoryOutputFormat.get(history);
  }
}
