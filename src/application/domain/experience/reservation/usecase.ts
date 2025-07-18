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
import {
  ParticipationStatusReason,
  ParticipationStatus,
  ReservationStatus,
  TransactionReason,
  Prisma,
  TicketStatus,
  TicketStatusReason,
} from "@prisma/client";
import { getCurrentUserId } from "@/application/domain/utils";
import { PrismaTicket } from "@/application/domain/reward/ticket/data/type";
import { PrismaParticipation } from "@/application/domain/experience/participation/data/type";
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";
import { ReservationStatuses } from "@/application/domain/experience/reservation/helper";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";
import ReservationPresenter from "@/application/domain/experience/reservation/presenter";
import { IReservationService } from "@/application/domain/experience/reservation/data/interface";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import { groupBy } from "graphql/jsutils/groupBy";
import ReservationValidator from "@/application/domain/experience/reservation/validator";
import OpportunitySlotService from "@/application/domain/experience/opportunitySlot/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import NotificationService from "@/application/domain/notification/service";
import { IParticipationService } from "@/application/domain/experience/participation/data/interface";
import ParticipationStatusHistoryService from "@/application/domain/experience/participation/statusHistory/service";
import TicketService from "@/application/domain/reward/ticket/service";
import { PrismaOpportunitySlotReserve } from "@/application/domain/experience/opportunitySlot/data/type";

@injectable()
export default class ReservationUseCase {
  constructor(
    @inject("ReservationService") private readonly reservationService: IReservationService,
    @inject("ReservationValidator") private readonly reservationValidator: ReservationValidator,
    @inject("WalletValidator") private readonly walletValidator: WalletValidator,
    @inject("OpportunitySlotService")
    private readonly opportunitySlotService: OpportunitySlotService,
    @inject("ParticipationService") private readonly participationService: IParticipationService,
    @inject("ParticipationStatusHistoryService")
    private readonly participationStatusHistoryService: ParticipationStatusHistoryService,
    @inject("TicketService") private readonly ticketService: TicketService,
    @inject("TransactionService") private readonly transactionService: ITransactionService,

    @inject("NotificationService") private readonly notificationService: NotificationService,
  ) {}

  async visitorBrowseReservations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryReservationsArgs,
  ): Promise<GqlReservationsConnection> {
    return this.reservationService.fetchReservations(ctx, { cursor, filter, sort, first });
  }

  async visitorViewReservation(
    ctx: IContext,
    { id }: GqlQueryReservationArgs,
  ): Promise<GqlReservation | null> {
    const record = await this.reservationService.findReservation(ctx, id);
    return record ? ReservationPresenter.get(record) : null;
  }

  async userReserveParticipation(
    { input }: GqlMutationReservationCreateArgs,
    ctx: IContext,
  ): Promise<GqlReservationCreatePayload> {
    const slot = await this.opportunitySlotService.findOpportunitySlotOrThrow(
      ctx,
      input.opportunitySlotId,
    );
    const { opportunity } = slot;

    this.reservationValidator.validateReservable(
      slot,
      input.totalParticipantCount,
      slot.remainingCapacityView?.remainingCapacity ?? undefined,
    );

    const { communityId, requiredUtilities, requireApproval } = opportunity;
    if (!communityId) throw new NotFoundError("Community id not found", { communityId });

    const reservation = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const statuses = resolveReservationStatuses(requireApproval);
      const reservation = await this.reservationService.createReservation(
        ctx,
        input.opportunitySlotId,
        input.totalParticipantCount,
        input.otherUserIds ?? [],
        statuses,
        tx,
        input.comment,
        communityId,
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

    await this.notificationService.pushReservationAppliedMessage(ctx, reservation);
    if (!requireApproval) {
      await this.notificationService.pushReservationAcceptedMessage(ctx, reservation);
    }

    return ReservationPresenter.create(reservation);
  }

  async userCancelMyReservation(
    { id, input }: GqlMutationReservationCancelArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const reservation = await this.reservationService.findReservationOrThrow(ctx, id);
    this.reservationValidator.validateCancellable(reservation.opportunitySlot.startsAt);

    await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      await this.reservationService.setStatus(
        ctx,
        reservation.id,
        currentUserId,
        ReservationStatus.CANCELED,
        tx,
      );

      await this.updateManyParticipationByReservationStatusChanged(
        ctx,
        reservation.participations,
        ParticipationStatus.NOT_PARTICIPATING,
        ParticipationStatusReason.RESERVATION_CANCELED,
        tx,
      );

      await this.handleRefundTicketAfterCancelIfNeeded(ctx, currentUserId, input, tx);
    });

    await this.notificationService.pushReservationCanceledMessage(ctx, reservation);
    return ReservationPresenter.setStatus(reservation);
  }

  async userJoinReservation(
    { id }: GqlMutationReservationJoinArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const reservation = await ctx.issuer.public(ctx, async (tx) => {
      const res = await this.reservationService.findReservationOrThrow(ctx, id);

      const { availableParticipationId } = this.reservationValidator.validateJoinable(
        res,
        currentUserId,
      );

      await this.participationService.setStatus(
        ctx,
        availableParticipationId,
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.RESERVATION_JOINED,
        tx,
        currentUserId,
      );

      return res;
    });

    return ReservationPresenter.setStatus(reservation);
  }

  async managerAcceptReservation(
    { id }: GqlMutationReservationAcceptArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    let acceptedReservation: PrismaReservation | null = null;

    const reservation = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const res = await this.reservationService.setStatus(
        ctx,
        id,
        currentUserId,
        ReservationStatus.ACCEPTED,
        tx,
      );

      await this.updateManyParticipationByReservationStatusChanged(
        ctx,
        res.participations,
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.RESERVATION_ACCEPTED,
        tx,
      );

      acceptedReservation = res;
      return res;
    });

    if (acceptedReservation) {
      await this.notificationService.pushReservationAcceptedMessage(ctx, acceptedReservation);
    }

    return ReservationPresenter.setStatus(reservation);
  }

  async managerRejectReservation(
    { id, input }: GqlMutationReservationRejectArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    let rejectedReservation: PrismaReservation | null = null;

    const reservation = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const res = await this.reservationService.setStatus(
        ctx,
        id,
        currentUserId,
        ReservationStatus.REJECTED,
        tx,
      );

      await this.updateManyParticipationByReservationStatusChanged(
        ctx,
        res.participations,
        ParticipationStatus.NOT_PARTICIPATING,
        ParticipationStatusReason.RESERVATION_REJECTED,
        tx,
      );

      rejectedReservation = res;
      return res;
    });

    if (rejectedReservation) {
      await this.notificationService.pushReservationRejectedMessage(
        ctx,
        rejectedReservation,
        input.comment,
      );
    }

    return ReservationPresenter.setStatus(reservation);
  }

  // ----------------------------
  // private methods
  // ----------------------------

  private async handleReserveTicketsIfNeeded(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    paymentMethod: GqlReservationPaymentMethod,
    requiredUtilities: PrismaOpportunitySlotReserve["opportunity"]["requiredUtilities"],
    participationIds: string[],
    ticketIds?: string[],
  ): Promise<void> {
    if (requiredUtilities.length === 0) return;
    if (paymentMethod !== GqlReservationPaymentMethod.Ticket) return;

    await this.ticketService.reserveManyTickets(ctx, participationIds, tx, ticketIds);
  }

  private async handleRefundTicketAfterCancelIfNeeded(
    ctx: IContext,
    currentUserId: string,
    input: GqlReservationCancelInput,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    if (input.paymentMethod !== GqlReservationPaymentMethod.Ticket) return;
    if (!input.ticketIdsIfExists?.length) return;

    const tickets = await this.ticketService.fetchTicketsByIds(ctx, input.ticketIdsIfExists);
    if (tickets.length === 0) return;

    const grouped = groupBy(tickets, (t) => t.utilityId);

    for (const utilityId in grouped) {
      const ticketsForUtility = grouped[utilityId].filter(
        (t) => t.status === TicketStatus.DISABLED && t.reason === TicketStatusReason.RESERVED,
      );
      if (ticketsForUtility.length === 0) continue;

      await this.refundUtilityTickets(ctx, currentUserId, ticketsForUtility, tx);
    }
  }

  private async refundUtilityTickets(
    ctx: IContext,
    currentUserId: string,
    tickets: PrismaTicket[],
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const sample = tickets[0];
    const transferPoints = sample.utility.pointsRequired * tickets.length;

    const { fromWalletId, toWalletId } = await this.walletValidator.validateCommunityMemberTransfer(
      ctx,
      tx,
      sample.utility.communityId,
      currentUserId,
      transferPoints,
      TransactionReason.TICKET_REFUNDED,
    );

    const transaction = await this.transactionService.refundTicket(
      ctx,
      tx,
      fromWalletId,
      toWalletId,
      transferPoints,
    );

    await this.ticketService.cancelReservedTicketsIfAvailable(ctx, tickets, currentUserId, tx);
    await this.ticketService.refundTickets(ctx, tickets, currentUserId, transaction.id, tx);
  }

  private async updateManyParticipationByReservationStatusChanged(
    ctx: IContext,
    participations: Pick<PrismaParticipation, "id">[],
    participationStatus: ParticipationStatus,
    participationStatusReason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
  ) {
    const participationIds = participations.map((p) => p.id);

    await Promise.all([
      this.participationService.bulkSetStatusByReservation(
        ctx,
        participationIds,
        participationStatus,
        participationStatusReason,
        tx,
      ),
      this.participationStatusHistoryService.bulkCreateStatusHistoriesForReservationStatusChanged(
        ctx,
        participationIds,
        participationStatus,
        participationStatusReason,
        tx,
      ),
    ]);
  }
}

// -----------------------------
// 外部関数
// -----------------------------
function resolveReservationStatuses(requireApproval: boolean): ReservationStatuses {
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
