import { IContext } from "@/types/server";
import {
  GqlOpportunityInvitationFilterInput,
  GqlOpportunityInvitationsConnection,
  GqlOpportunityInvitationSortInput,
} from "@/types/graphql";
import { clampFirst } from "@/utils";
import OpportunityInvitationService from "@/application/opportunityInvitation/service";
import OpportunityInvitationPresenter from "@/application/opportunityInvitation/presenter";

export default class OpportunityInvitationUtils {
  static async fetchOpportunityInvitationsCommon(
    ctx: IContext,
    {
      filter,
      sort,
      cursor,
      first,
    }: {
      filter?: GqlOpportunityInvitationFilterInput;
      sort?: GqlOpportunityInvitationSortInput;
      cursor?: string;
      first?: number;
    },
  ): Promise<GqlOpportunityInvitationsConnection> {
    const take = clampFirst(first);
    const rows = await OpportunityInvitationService.fetchOpportunityInvitations(
      ctx,
      { filter, sort, cursor },
      take,
    );
    const hasNextPage = rows.length > take;
    const data = rows.slice(0, take).map((record) => OpportunityInvitationPresenter.get(record));
    return OpportunityInvitationPresenter.query(data, hasNextPage);
  }
}
