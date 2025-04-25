import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotsConnection,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
  GqlOpportunitySlotsBulkUpdatePayload,
  GqlMutationOpportunitySlotSetHostingStatusArgs,
  GqlOpportunitySlotSetHostingStatusPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunitySlotService from "@/application/domain/experience/opportunitySlot/service";
import OpportunitySlotPresenter from "@/application/domain/experience/opportunitySlot/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { clampFirst } from "@/application/domain/utils";
import { OpportunitySlotHostingStatus } from "@prisma/client";
import ParticipationService from "@/application/domain/experience/participation/service";
import ParticipationStatusHistoryService from "@/application/domain/experience/participation/statusHistory/service";
import { PrismaOpportunitySlotWithParticipation } from "@/application/domain/experience/opportunitySlot/data/type";
import NotificationService from "@/application/domain/notification/service";

export default class OpportunitySlotUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseOpportunitySlots(
    { cursor, filter, sort, first }: GqlQueryOpportunitySlotsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotsConnection> {
    const take = clampFirst(first);
    const records = await OpportunitySlotService.fetchOpportunitySlots(
      ctx,
      { cursor, filter, sort },
      take,
    );

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => OpportunitySlotPresenter.get(record));

    return OpportunitySlotPresenter.query(data, hasNextPage);
  }

  static async visitorViewOpportunitySlot(
    { id }: GqlQueryOpportunitySlotArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlot | null> {
    const slot = await OpportunitySlotService.findOpportunitySlot(ctx, id);
    if (!slot) return null;
    return OpportunitySlotPresenter.get(slot);
  }

  static async managerSetOpportunitySlotHostingStatus(
    { id, input }: GqlMutationOpportunitySlotSetHostingStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotSetHostingStatusPayload> {
    let cancelledSlot: PrismaOpportunitySlotWithParticipation | null = null;

    const res = await this.issuer.public(ctx, async (tx) => {
      const slot = await OpportunitySlotService.setOpportunitySlotHostingStatus(
        ctx,
        id,
        input.status,
        tx,
      );

      if (input.status === OpportunitySlotHostingStatus.CANCELLED) {
        const participationIds =
          slot.reservations?.flatMap((r) => r.participations?.map((p) => p.id) ?? []) ?? [];

        await Promise.all([
          ParticipationService.bulkCancelParticipationsByOpportunitySlot(ctx, participationIds, tx),
          ParticipationStatusHistoryService.bulkCreateStatusHistoriesForCancelledOpportunitySlot(
            ctx,
            participationIds,
            tx,
          ),
        ]);

        cancelledSlot = slot;
      }

      return slot;
    });

    if (cancelledSlot) {
      await NotificationService.pushCancelOpportunitySlotMessage(ctx, cancelledSlot);
    }

    return OpportunitySlotPresenter.setHostingStatus(res);
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
