import { IContext } from "@/types/server";
import {
  GqlOpportunitySlotFilterInput,
  GqlOpportunitySlotsConnection,
  GqlOpportunitySlotSortInput,
} from "@/types/graphql";
import { clampFirst } from "@/utils";
import OpportunitySlotService from "@/application/opportunitySlot/service";
import OpportunitySlotPresenter from "@/application/opportunitySlot/presenter";

export default class OpportunitySlotUtils {
  static async fetchOpportunitySlotsCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlOpportunitySlotFilterInput;
      sort?: GqlOpportunitySlotSortInput;
      first?: number;
    },
  ): Promise<GqlOpportunitySlotsConnection> {
    const take = clampFirst(first);

    const res = await OpportunitySlotService.fetchOpportunitySlots(
      ctx,
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = res.length > take;

    const data = res.slice(0, take).map((record) => {
      return OpportunitySlotPresenter.get(record);
    });

    return OpportunitySlotPresenter.query(data, hasNextPage);
  }
}
