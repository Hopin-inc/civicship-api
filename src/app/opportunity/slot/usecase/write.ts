import {
  GqlOpportunitySlotsBulkUpdatePayload,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import OpportunitySlotService from "@/app/opportunity/slot/service";
import OpportunitySlotOutputFormat from "@/presentation/graphql/dto/opportunity/slot/output";

export default class OpportunitySlotWriteUseCase {
  private static issuer = new PrismaClientIssuer();

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
