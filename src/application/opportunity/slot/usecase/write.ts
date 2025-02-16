import {
  GqlOpportunitySlotsBulkUpdatePayload,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import OpportunitySlotService from "@/application/opportunity/slot/service";
import OpportunitySlotOutputFormat from "@/presentation/graphql/dto/opportunity/slot/output";

export default class OpportunitySlotWriteUseCase {
  private static issuer = new PrismaClientIssuer();

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
