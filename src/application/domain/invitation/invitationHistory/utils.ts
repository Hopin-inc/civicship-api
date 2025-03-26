import { IContext } from "@/types/server";
import { clampFirst } from "@/application/domain/utils";
import {
  GqlOpportunityInvitationHistoryFilterInput,
  GqlOpportunityInvitationHistorySortInput,
  GqlOpportunityInvitationHistoriesConnection,
} from "@/types/graphql";
import OpportunityInvitationHistoryService from "@/application/domain/invitation/invitationHistory/service";
import OpportunityInvitationHistoryPresenter from "@/application/domain/invitation/invitationHistory/presenter";

export default class OpportunityInvitationHistoryUtils {
  static async fetchInvitationHistoriesCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      filter?: GqlOpportunityInvitationHistoryFilterInput;
      sort?: GqlOpportunityInvitationHistorySortInput;
      cursor?: string;
      first?: number;
    },
  ): Promise<GqlOpportunityInvitationHistoriesConnection> {
    const take = clampFirst(first);
    const rows = await OpportunityInvitationHistoryService.fetchInvitationHistories(
      ctx,
      { filter, sort, cursor },
      take,
    );
    const hasNextPage = rows.length > take;
    const data = rows
      .slice(0, take)
      .map((record) => OpportunityInvitationHistoryPresenter.get(record));
    return OpportunityInvitationHistoryPresenter.query(data, hasNextPage);
  }
}
