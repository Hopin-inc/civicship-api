import {
  GqlQueryOpportunitySlotsArgs,
  GqlOpportunitySlotsConnection,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
  GqlOpportunitySlotsBulkUpdatePayload,
  GqlMutationOpportunitySlotSetHostingStatusArgs,
  GqlOpportunitySlotSetHostingStatusPayload,
  GqlOpportunitySlot,
  GqlQueryOpportunitySlotArgs,
  GqlMutationOpportunitySlotCreateArgs,
  GqlOpportunitySlotCreatePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunitySlotService from "@/application/domain/experience/opportunitySlot/service";
import OpportunitySlotPresenter from "@/application/domain/experience/opportunitySlot/presenter";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { OpportunitySlotHostingStatus, ReservationStatus } from "@prisma/client";
import ParticipationStatusHistoryService from "@/application/domain/experience/participation/statusHistory/service";
import NotificationService from "@/application/domain/notification/service";
import { inject, injectable } from "tsyringe";
import ParticipationService from "@/application/domain/experience/participation/service";
import { PrismaOpportunitySlotSetHostingStatus } from "@/application/domain/experience/opportunitySlot/data/type";
import ReservationService from "@/application/domain/experience/reservation/service";

@injectable()
export default class OpportunitySlotUseCase {
  constructor(
    @inject("OpportunitySlotService") private readonly service: OpportunitySlotService,
    @inject("ParticipationService") private readonly participationService: ParticipationService,
    @inject("ParticipationStatusHistoryService")
    private readonly participationStatusHistoryService: ParticipationStatusHistoryService,
    @inject("NotificationService") private readonly notificationService: NotificationService,
    @inject("ReservationService") private readonly reservationService: ReservationService,
  ) {}

  async visitorBrowseOpportunitySlots(
    { cursor, filter, sort, first }: GqlQueryOpportunitySlotsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotsConnection> {
    const take = clampFirst(first);
    const records = await this.service.fetchOpportunitySlots(ctx, { cursor, filter, sort }, take);

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => OpportunitySlotPresenter.get(record));

    return OpportunitySlotPresenter.query(data, hasNextPage, cursor);
  }

  async visitorViewOpportunitySlot(
    { id }: GqlQueryOpportunitySlotArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlot | null> {
    const slot = await this.service.findOpportunitySlot(ctx, id);
    if (!slot) return null;
    return OpportunitySlotPresenter.get(slot);
  }

  async managerCreateOpportunitySlot(
    { opportunityId, input }: GqlMutationOpportunitySlotCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotCreatePayload> {
    const slot = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return this.service.createOpportunitySlot(ctx, opportunityId, input, tx);
    });

    return OpportunitySlotPresenter.create(slot);
  }

  async managerSetOpportunitySlotHostingStatus(
    { id, input }: GqlMutationOpportunitySlotSetHostingStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotSetHostingStatusPayload> {
    let cancelledSlot: PrismaOpportunitySlotSetHostingStatus | null = null;
    const currentUserId = getCurrentUserId(ctx, input.createdBy);

    const res = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const slot = await this.service.setOpportunitySlotHostingStatus(
        ctx,
        id,
        input.status,
        input.capacity,
        tx,
      );

      if (input.status === OpportunitySlotHostingStatus.CANCELLED) {
        const reservationIds = slot.reservations?.map((r) => r.id) ?? [];
        const participationIds =
          slot.reservations?.flatMap((r) => r.participations?.map((p) => p.id) ?? []) ?? [];

        await Promise.all([
          this.participationService.bulkCancelParticipationsByOpportunitySlot(
            ctx,
            participationIds,
            tx,
          ),
          this.participationStatusHistoryService.bulkCreateStatusHistoriesForCancelledOpportunitySlot(
            ctx,
            participationIds,
            currentUserId,
            tx,
          ),
          ...reservationIds.map((reservationId) =>
            this.reservationService.setStatus(
              ctx,
              reservationId,
              currentUserId,
              ReservationStatus.REJECTED,
              tx,
            ),
          ),
        ]);

        cancelledSlot = slot;
      }

      return slot;
    });

    if (cancelledSlot) {
      await this.notificationService.pushCancelOpportunitySlotMessage(
        ctx,
        cancelledSlot,
        input.comment,
      );
    }

    return OpportunitySlotPresenter.setHostingStatus(res);
  }

  async managerBulkUpdateOpportunitySlots(
    { input }: GqlMutationOpportunitySlotsBulkUpdateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySlotsBulkUpdatePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      await this.service.bulkCreateOpportunitySlots(
        ctx,
        input.opportunityId,
        input.create ?? [],
        tx,
      );
      await this.service.bulkUpdateOpportunitySlots(ctx, input.update ?? [], tx);
      await this.service.bulkDeleteOpportunitySlots(ctx, input.delete ?? [], tx);

      const rows = await this.service.fetchAllSlotByOpportunityId(ctx, {
        opportunityIds: [input.opportunityId],
      });
      return OpportunitySlotPresenter.bulkUpdate(rows.map((r) => OpportunitySlotPresenter.get(r)));
    });
  }

  /**
   * Get the total number of participants for a slot
   */
  async getParticipantsCount(slotId: string, ctx: IContext): Promise<number> {
    return this.service.getParticipantsCount(ctx, slotId);
  }

  /**
   * Get the number of evaluated participants for a slot
   */
  async getEvaluatedParticipantsCount(slotId: string, ctx: IContext): Promise<number> {
    return this.service.getEvaluatedParticipantsCount(ctx, slotId);
  }

  /**
   * Check if all participants of a slot have been evaluated
   */
  async isSlotFullyEvaluated(slotId: string, ctx: IContext): Promise<boolean> {
    return this.service.isSlotFullyEvaluated(ctx, slotId);
  }
}
