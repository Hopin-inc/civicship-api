import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotsConnection,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
  GqlOpportunitySlotsBulkUpdatePayload,
  GqlOpportunity,
  GqlOpportunitySlotsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunitySlotService from "@/application/opportunitySlot/service";
import OpportunitySlotPresenter from "@/application/opportunitySlot/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import OpportunitySlotUtils from "@/application/opportunitySlot/utilis";

export default class OpportunitySlotUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseOpportunitySlots(
    args: GqlQueryOpportunitySlotsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotsConnection> {
    return OpportunitySlotUtils.fetchOpportunitySlotsCommon(ctx, args);
  }

  static async visitorBrowseOpportunitySlotsByOpportunity(
    { id }: GqlOpportunity,
    args: GqlOpportunitySlotsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotsConnection> {
    return OpportunitySlotUtils.fetchOpportunitySlotsCommon(ctx, {
      ...args,
      filter: { opportunityId: id },
    });
  }

  static async visitorViewOpportunitySlot(
    { id }: GqlQueryOpportunitySlotArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlot | null> {
    const slot = await OpportunitySlotService.findOpportunitySlot(ctx, id);
    if (!slot) return null;
    return OpportunitySlotPresenter.get(slot);
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
      return OpportunitySlotPresenter.bulkUpdate(rows.map((r) => OpportunitySlotPresenter.get(r)));
    });
  }
}
