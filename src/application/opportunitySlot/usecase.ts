import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotsConnection,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
  GqlOpportunitySlotsBulkUpdatePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";
import OpportunitySlotService from "@/application/opportunitySlot/service";
import OpportunitySlotOutputFormat from "@/application/opportunitySlot/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export default class OpportunitySlotUseCase {
  private static issuer = new PrismaClientIssuer();

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

  static async managerBulkUpdateOpportunitySlots(
    { input }: GqlMutationOpportunitySlotsBulkUpdateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotsBulkUpdatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      await OpportunitySlotService.bulkCreateOpportunitySlots(
        ctx,
        input.opportunityId,
        input.create ?? [],
        tx,
      );
      await OpportunitySlotService.bulkUpdateOpportunitySlots(ctx, input.update ?? [], tx);
      await OpportunitySlotService.bulkDeleteOpportunitySlots(ctx, input.delete ?? [], tx);

      const rows = await OpportunitySlotService.fetchAllSlotByOpportunityId(
        ctx,
        input.opportunityId,
        tx,
      );
      return OpportunitySlotOutputFormat.bulkUpdate(
        rows.map((r) => OpportunitySlotOutputFormat.get(r)),
      );
    });
  }
}
