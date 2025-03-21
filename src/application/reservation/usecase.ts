import {
  GqlMutationReservationCreateArgs,
  GqlMutationReservationAcceptArgs,
  GqlMutationReservationRejectArgs,
  GqlMutationReservationCancelArgs,
  GqlMutationReservationJoinArgs,
  GqlQueryReservationArgs,
  GqlQueryReservationsArgs,
  GqlReservation,
  GqlReservationsConnection,
  GqlReservationCreatePayload,
  GqlReservationSetStatusPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ReservationService from "@/application/reservation/service";
import ReservationPresenter from "@/application/reservation/presenter";
import { ParticipationStatusReason, ParticipationStatus, ReservationStatus } from "@prisma/client";
import { NotFoundError } from "@/errors/graphql";
import { getCurrentUserId } from "@/application/utils";
import OpportunitySlotService from "@/application/opportunitySlot/service";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import TicketService from "@/application/ticket/service";
import ParticipationService from "@/application/participation/service";
import ParticipationStatusHistoryService from "@/application/participation/statusHistory/service";
import { PrismaReservation } from "@/application/reservation/data/type";

export default class ReservationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseReservations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryReservationsArgs,
  ): Promise<GqlReservationsConnection> {
    return ReservationService.fetchReservations(ctx, { cursor, filter, sort, first });
  }

  static async visitorViewReservation(
    ctx: IContext,
    { id }: GqlQueryReservationArgs,
  ): Promise<GqlReservation | null> {
    const record = await ReservationService.findReservation(ctx, id);
    return record ? ReservationPresenter.get(record) : null;
  }

  static async userReserveParticipation(
    { input }: GqlMutationReservationCreateArgs,
    ctx: IContext,
  ): Promise<GqlReservationCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    const slot = await OpportunitySlotService.findOpportunitySlotOrThrow(
      ctx,
      input.opportunitySlotId,
    );

    const { opportunity, capacity, startsAt, endsAt } = slot;
    await ReservationService.checkConflictBeforeReservation(ctx, currentUserId, startsAt, endsAt);

    if (!opportunity) {
      throw new NotFoundError("Opportunity with OpportunitySlot", {
        opportunitySlotId: input.opportunitySlotId,
      });
    }

    const { communityId, requireApproval, requiredUtilities } = opportunity;
    if (!communityId) {
      throw new NotFoundError("Community with Opportunity", { communityId });
    }

    const currentCount = await ParticipationService.countActiveParticipantsBySlotId(
      ctx,
      input.opportunitySlotId,
    );
    ReservationService.validateCapacity(capacity, input.participantCount, currentCount);

    const { reservationStatus, participationStatus, participationStatusReason } =
      resolveReservationStatuses(requireApproval);

    const reservation = await this.issuer.public(ctx, async (tx) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      // TODO ticketが必要だけど、不要なケースもあるみたいなのある？
      if (requiredUtilities.length > 0) {
        await TicketService.reserveOrUseTicket(ctx, participationStatus, tx, input.ticketId);
      }

      return ReservationService.createReservation(
        ctx,
        input.opportunitySlotId,
        input.participantCount,
        input.otherParticipantUserIds,
        reservationStatus,
        participationStatus,
        participationStatusReason,
      );
    });

    return ReservationPresenter.create(reservation);
  }

  static async userJoinReservation(
    { id }: GqlMutationReservationJoinArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const reservation = await this.issuer.public(ctx, async (tx) => {
      const res = await ReservationService.findReservationOrThrow(ctx, id);

      const { availableParticipationId } = ReservationService.validateJoinable(res, currentUserId);

      await ParticipationService.setStatus(
        ctx,
        availableParticipationId,
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.RESERVATION_JOINED,
        currentUserId,
        tx,
      );

      return res;
    });

    return ReservationPresenter.setStatus(reservation);
  }

  static async userCancelMyReservation(
    { id }: GqlMutationReservationCancelArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const reservation = await this.handleReservationStatusChange(
      ctx,
      id,
      ReservationStatus.CANCELED,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.RESERVATION_CANCELED,
    );
    ReservationService.validateCancellable(reservation.opportunitySlot.startsAt);

    return ReservationPresenter.setStatus(reservation);
  }

  static async managerAcceptReservation(
    { id }: GqlMutationReservationAcceptArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const reservation = await this.handleReservationStatusChange(
      ctx,
      id,
      ReservationStatus.ACCEPTED,
      ParticipationStatus.PARTICIPATING,
      ParticipationStatusReason.RESERVATION_ACCEPTED,
    );

    return ReservationPresenter.setStatus(reservation);
  }

  static async managerRejectReservation(
    { id }: GqlMutationReservationRejectArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const reservation = await this.handleReservationStatusChange(
      ctx,
      id,
      ReservationStatus.REJECTED,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.RESERVATION_REJECTED,
    );

    return ReservationPresenter.setStatus(reservation);
  }

  private static async handleReservationStatusChange(
    ctx: IContext,
    reservationId: string,
    reservationStatus: ReservationStatus,
    participationStatus: ParticipationStatus,
    participationReason: ParticipationStatusReason,
  ): Promise<PrismaReservation> {
    const currentUserId = getCurrentUserId(ctx);

    return await this.issuer.public(ctx, async (tx) => {
      const reservation = await ReservationService.setStatus(
        ctx,
        reservationId,
        currentUserId,
        reservationStatus,
        tx,
      );

      const participations = await ParticipationService.fetchParticipationsByReservationId(
        ctx,
        reservationId,
      );
      const participationIds = participations.map((p) => p.id);

      await Promise.all([
        ParticipationService.bulkSetStatusByReservation(
          ctx,
          participationIds,
          participationStatus,
          participationReason,
          tx,
        ),
        ParticipationStatusHistoryService.bulkCreateStatusHistoriesForReservationStatusChanged(
          ctx,
          participationIds,
          participationStatus,
          participationReason,
          tx,
        ),
      ]);

      return reservation;
    });
  }
}

function resolveReservationStatuses(requireApproval: boolean) {
  return {
    reservationStatus: requireApproval ? ReservationStatus.APPLIED : ReservationStatus.ACCEPTED,
    participationStatus: requireApproval
      ? ParticipationStatus.PENDING
      : ParticipationStatus.PARTICIPATING,
    participationStatusReason: requireApproval
      ? ParticipationStatusReason.RESERVATION_APPLIED
      : ParticipationStatusReason.RESERVATION_ACCEPTED,
  };
}
