import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotsConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";
import OpportunitySlotService from "@/application/opportunity/slot/service";
import OpportunitySlotOutputFormat from "@/presentation/graphql/dto/opportunity/slot/output";

export default class OpportunitySlotReadUseCase {
  static async visitorBrowseOpportunitySlots(
    { filter, sort, cursor, first }: GqlQueryOpportunitySlotsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotsConnection> {
    const take = clampFirst(first);
    const rows = await OpportunitySlotService.fetchOpportunitySlots(
      ctx,
      { filter, sort, cursor },
      take,
    );
    const hasNextPage = rows.length > take;
    const data = rows.slice(0, take).map((record) => OpportunitySlotOutputFormat.get(record));
    return OpportunitySlotOutputFormat.query(data, hasNextPage);
  }

  static async visitorViewOpportunitySlot(
    { id }: GqlQueryOpportunitySlotArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlot | null> {
    const slot = await OpportunitySlotService.findOpportunitySlot(ctx, id);
    if (!slot) return null;
    return OpportunitySlotOutputFormat.get(slot);
  }
}
