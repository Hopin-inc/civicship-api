import {
  GqlMutationReservationCreateArgs,
  GqlMutationReservationAcceptArgs,
  GqlMutationReservationRejectArgs,
  GqlMutationReservationJoinArgs,
  GqlQueryReservationArgs,
  GqlQueryReservationsArgs,
  GqlReservation,
  GqlReservationsConnection,
  GqlReservationCreatePayload,
  GqlReservationSetStatusPayload,
  GqlReservationPaymentMethod,
  GqlMutationReservationCancelArgs,
  GqlReservationCancelInput,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ReservationService from "@/application/domain/reservation/service";
import ReservationPresenter from "@/application/domain/reservation/presenter";
import {
  ParticipationStatusReason,
  ParticipationStatus,
  ReservationStatus,
  Prisma,
  TicketStatus,
  TicketStatusReason,
} from "@prisma/client";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import OpportunitySlotService from "@/application/domain/opportunitySlot/service";
import WalletService from "@/application/domain/membership/wallet/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationService from "@/application/domain/participation/service";
import TicketService from "@/application/domain/ticket/service";
import { PrismaOpportunitySlot } from "@/application/domain/opportunitySlot/data/type";
import MembershipService from "@/application/domain/membership/service";
import { groupBy } from "graphql/jsutils/groupBy";
import ReservationValidator from "@/application/domain/reservation/validator";
import { ReservationStatuses } from "@/application/domain/reservation/type";
import { PrismaParticipation } from "@/application/domain/participation/data/type";
import ParticipationStatusHistoryService from "@/application/domain/participation/statusHistory/service";
import { NotFoundError } from "@/errors/graphql";
import NotificationService from "@/application/domain/notification/service";
import { PrismaReservation } from "@/application/domain/reservation/data/type";

export default class ReservationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseReservations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryReservationsArgs,
  ): Promise<GqlReservationsConnection> {
    const take = clampFirst(first);

    const records = await ReservationService.fetchReservations(
      ctx,
      {
        cursor,
        filter,
        sort,
      },
      take,
    );

    const hasNextPage = records.length > take;
    const sliced = records.slice(0, take).map(ReservationPresenter.get);
    return ReservationPresenter.query(sliced, hasNextPage);
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
    await this.validateBeforeReserve(ctx, currentUserId, slot, input);

    const { communityId, requiredUtilities, requireApproval } = slot.opportunity;
    if (!communityId) throw new NotFoundError("Community id not found", { communityId });

    const reservation = await this.issuer.public(ctx, async (tx) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      const statuses = this.resolveReservationStatuses(requireApproval);
      const reservation = await ReservationService.createReservation(
        ctx,
        input.opportunitySlotId,
        input.totalParticipantCount,
        input.otherUserIds,
        statuses,
        tx,
      );

      const participationIds = reservation.participations.map((p) => p.id);
      await this.handleReserveTicketsIfNeeded(
        ctx,
        tx,
        input.paymentMethod,
        requiredUtilities,
        participationIds,
        input.ticketIdsIfNeed,
      );

      return reservation;
    });

    await NotificationService.pushReservationAppliedMessage(ctx, reservation);
    return ReservationPresenter.create(reservation);
  }

  static async userCancelMyReservation(
    { id, input }: GqlMutationReservationCancelArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const reservation = await ReservationService.findReservationOrThrow(ctx, id);
    ReservationValidator.validateCancellable(reservation.opportunitySlot.startsAt);

    await this.issuer.public(ctx, async (tx) => {
      await this.handleCancelReservation(ctx, reservation, currentUserId, input, tx);
    });

    await NotificationService.pushReservationCanceledMessage(ctx, reservation);
    return ReservationPresenter.setStatus(reservation);
  }

  static async userJoinReservation(
    { id }: GqlMutationReservationJoinArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const res = await ReservationService.findReservationOrThrow(ctx, id);

    const reservation = await this.issuer.public(ctx, async (tx) => {
      const { availableParticipationId } = ReservationValidator.validateJoinable(
        res,
        currentUserId,
      );

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

  static async managerAcceptReservation(
    { id }: GqlMutationReservationAcceptArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const reservation = await this.issuer.public(ctx, async (tx) => {
      const res = await ReservationService.setStatus(
        ctx,
        id,
        currentUserId,
        ReservationStatus.ACCEPTED,
        tx,
      );

      await this.applyParticipationStatusChanges(
        ctx,
        res.participations,
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.RESERVATION_ACCEPTED,
        tx,
      );

      return res;
    });

    if (reservation.status === ReservationStatus.ACCEPTED) {
      await NotificationService.pushReservationAcceptedMessage(ctx, reservation);
    }

    return ReservationPresenter.setStatus(reservation);
  }

  static async managerRejectReservation(
    { id }: GqlMutationReservationRejectArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const reservation = await this.issuer.public(ctx, async (tx) => {
      const reservation = await ReservationService.setStatus(
        ctx,
        id,
        currentUserId,
        ReservationStatus.REJECTED,
        tx,
      );

      await this.applyParticipationStatusChanges(
        ctx,
        reservation.participations,
        ParticipationStatus.NOT_PARTICIPATING,
        ParticipationStatusReason.RESERVATION_REJECTED,
        tx,
      );

      return reservation;
    });

    return ReservationPresenter.setStatus(reservation);
  }

  private static async validateBeforeReserve(
    ctx: IContext,
    currentUserId: string,
    slot: PrismaOpportunitySlot,
    input: GqlMutationReservationCreateArgs["input"],
  ): Promise<void> {
    const reservationExists = await ReservationService.fetchConflictingReservations(
      ctx,
      currentUserId,
      slot.id,
    );

    ReservationValidator.validateReservable(
      slot,
      input.totalParticipantCount,
      slot.remainingCapacityView?.remainingCapacity ?? undefined,
      reservationExists,
    );
  }

  private static async handleReserveTicketsIfNeeded(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    paymentMethod: GqlReservationPaymentMethod,
    requiredUtilities: PrismaOpportunitySlot["opportunity"]["requiredUtilities"],
    participationIds: string[],
    ticketIds?: string[],
  ): Promise<void> {
    if (requiredUtilities.length === 0) return;
    if (paymentMethod !== GqlReservationPaymentMethod.Ticket) return;

    await TicketService.reserveManyTickets(ctx, participationIds, ticketIds, tx);
  }

  private static async handleCancelReservation(
    ctx: IContext,
    reservation: PrismaReservation,
    currentUserId: string,
    input: GqlReservationCancelInput,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await ReservationService.setStatus(
      ctx,
      reservation.id,
      currentUserId,
      ReservationStatus.CANCELED,
      tx,
    );

    await this.applyParticipationStatusChanges(
      ctx,
      reservation.participations,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.RESERVATION_CANCELED,
      tx,
    );

    await this.cancelReservedTicketsIfNeeded(ctx, currentUserId, input, tx);
  }

  private static async applyParticipationStatusChanges(
    ctx: IContext,
    participations: PrismaParticipation[],
    participationStatus: ParticipationStatus,
    participationStatusReason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
  ) {
    const participationIds = participations.map((p) => p.id);

    await Promise.all([
      ParticipationService.bulkSetStatusByReservation(
        ctx,
        participationIds,
        participationStatus,
        participationStatusReason,
        tx,
      ),
      ParticipationStatusHistoryService.bulkCreateStatusHistoriesForReservationStatusChanged(
        ctx,
        participationIds,
        participationStatus,
        participationStatusReason,
        tx,
      ),
    ]);
  }

  private static async cancelReservedTicketsIfNeeded(
    ctx: IContext,
    currentUserId: string,
    input: GqlReservationCancelInput,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    if (
      input.paymentMethod !== GqlReservationPaymentMethod.Ticket ||
      !input.ticketIdsIfExists?.length
    ) {
      return;
    }

    const tickets = await TicketService.fetchTicketsByIds(ctx, input.ticketIdsIfExists);
    if (tickets.length === 0) return;

    const grouped = groupBy(tickets, (t) => t.utilityId);

    for (const ticketGroup of Object.values(grouped)) {
      const ticketsForUtility = ticketGroup.filter(
        (t) => t.status === TicketStatus.DISABLED && t.reason === TicketStatusReason.RESERVED,
      );
      if (ticketsForUtility.length > 0) {
        await TicketService.cancelReservedTicketsIfAvailable(
          ctx,
          ticketsForUtility,
          currentUserId,
          tx,
        );
      }
    }
  }

  private static resolveReservationStatuses(requireApproval: boolean): ReservationStatuses {
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
}
