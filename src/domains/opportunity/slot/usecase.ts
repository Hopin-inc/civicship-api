import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotsConnection,
  GqlOpportunitySlotsBulkUpdatePayload,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/prisma/client";
import { clampFirst } from "@/utils";
import OpportunitySlotService from "@/domains/opportunity/slot/service";
import OpportunitySlotOutputFormat from "@/domains/opportunity/slot/presenter/output";

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
      for (const createItem of input.create ?? []) {
        await OpportunitySlotService.createOpportunitySlot(
          ctx,
          input.opportunityId,
          createItem,
          tx,
        );
      }

      for (const updateItem of input.update ?? []) {
        await OpportunitySlotService.updateOpportunitySlot(ctx, updateItem.id, updateItem, tx);
      }

      for (const deleteId of input.delete ?? []) {
        await OpportunitySlotService.deleteOpportunitySlot(ctx, deleteId, tx);
      }

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
