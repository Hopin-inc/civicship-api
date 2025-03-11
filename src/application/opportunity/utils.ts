import { IContext } from "@/types/server";
import {
  GqlOpportunitiesConnection,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
} from "@/types/graphql";
import OpportunityService from "@/application/opportunity/service";
import OpportunityPresenter from "@/application/opportunity/presenter";
import { clampFirst } from "@/utils";

export default class OpportunityUtils {
  static async fetchOpportunitiesCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlOpportunityFilterInput;
      sort?: GqlOpportunitySortInput;
      first?: number;
    },
  ): Promise<GqlOpportunitiesConnection> {
    const take = clampFirst(first);

    const res = await OpportunityService.fetchPublicOpportunities(
      ctx,
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = res.length > take;

    const data = res.slice(0, take).map((record) => {
      return OpportunityPresenter.get(record);
    });

    return OpportunityPresenter.query(data, hasNextPage);
  }
}
