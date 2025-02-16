import { IContext } from "@/types/server";
import {
  GqlOpportunitiesConnection,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
} from "@/types/graphql";
import OpportunityService from "@/app/opportunity/service";
import OpportunityOutputFormat from "@/presentation/graphql/dto/opportunity/output";
import { clampFirst } from "@/utils";

export const OpportunityUtils = {
  async fetchOpportunitiesCommon(
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
      return OpportunityOutputFormat.get(record);
    });

    return OpportunityOutputFormat.query(data, hasNextPage);
  },
};
