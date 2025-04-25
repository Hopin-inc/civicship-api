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
  TransactionReason,
  Prisma,
  TicketStatus,
  TicketStatusReason,
} from "@prisma/client";
import { getCurrentUserId } from "@/application/domain/utils";
import OpportunitySlotService from "@/application/domain/opportunitySlot/service";
import WalletService from "@/application/domain/wallet/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationService from "@/application/domain/participation/service";
import TicketService from "@/application/domain/ticket/service";
import TransactionService from "@/application/domain/transaction/service";
import { PrismaOpportunitySlot } from "@/application/domain/opportunitySlot/data/type";
import MembershipService from "@/application/domain/membership/service";
import { groupBy } from "graphql/jsutils/groupBy";
import { PrismaTicket } from "@/application/domain/ticket/data/type";
import ReservationValidator from "@/application/domain/reservation/validator";
import { ReservationStatuses } from "@/application/domain/reservation/helper";
import { PrismaParticipation } from "@/application/domain/participation/data/type";
import ParticipationStatusHistoryService from "@/application/domain/participation/statusHistory/service";
import { NotFoundError } from "@/errors/graphql";
import WalletValidator from "@/application/domain/wallet/validator";
import { PrismaReservation } from "@/application/domain/reservation/data/type";
import NotificationService from "@/application/domain/notification/service";

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
    const { opportunity } = slot;

    // 重複チェック
    const reservationExists = await ReservationService.fetchConflictingReservations(
      ctx,
      currentUserId,
      slot.id,
    );

    // 予約可能性のバリデーション（開催前・キャンセル済み・満員など）
    ReservationValidator.validateReservable(
      slot,
      input.totalParticipantCount,
      slot.remainingCapacityView?.remainingCapacity ?? undefined,
      reservationExists,
    );

    const { communityId, requiredUtilities } = opportunity;
    if (!communityId) throw new NotFoundError("Community id not found", { communityId });

    const reservation = await this.issuer.public(ctx, async (tx) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      const statuses = resolveReservationStatuses(opportunity.requireApproval);
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
      await ReservationService.setStatus(
        ctx,
        reservation.id,
        currentUserId,
        ReservationStatus.CANCELED,
        tx,
      );

      await updateManyParticipationByReservationStatusChanged(
        ctx,
        reservation.participations,
        ParticipationStatus.NOT_PARTICIPATING,
        ParticipationStatusReason.RESERVATION_CANCELED,
        tx,
      );

      await handleRefundTicketAfterCancelIfNeeded(ctx, currentUserId, input, tx);
    });

    await NotificationService.pushReservationCanceledMessage(ctx, reservation);
    return ReservationPresenter.setStatus(reservation);
  }

  static async userJoinReservation(
    { id }: GqlMutationReservationJoinArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const reservation = await this.issuer.public(ctx, async (tx) => {
      const res = await ReservationService.findReservationOrThrow(ctx, id);

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

    let acceptedReservation: PrismaReservation | null = null;

    const reservation = await this.issuer.public(ctx, async (tx) => {
      const res = await ReservationService.setStatus(
        ctx,
        id,
        currentUserId,
        ReservationStatus.ACCEPTED,
        tx,
      );

      await updateManyParticipationByReservationStatusChanged(
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
      await NotificationService.pushReservationAcceptedMessage(ctx, acceptedReservation);
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

      await updateManyParticipationByReservationStatusChanged(
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
}

//  ------------------------------
//  function for reservation usecase
//  ------------------------------
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

async function handleRefundTicketAfterCancelIfNeeded(
  ctx: IContext,
  currentUserId: string,
  input: GqlReservationCancelInput,
  tx: Prisma.TransactionClient,
): Promise<void> {
  if (input.paymentMethod !== GqlReservationPaymentMethod.Ticket) return;
  if (!input.ticketIdsIfExists?.length) return;

  const tickets = await TicketService.fetchTicketsByIds(ctx, input.ticketIdsIfExists);
  if (tickets.length === 0) return;

  const grouped = groupBy(tickets, (t) => t.utilityId);

  for (const utilityId in grouped) {
    const ticketsForUtility = grouped[utilityId].filter(
      (t) => t.status === TicketStatus.DISABLED && t.reason === TicketStatusReason.RESERVED,
    );
    if (ticketsForUtility.length === 0) continue;

    await refundUtilityTickets(ctx, currentUserId, ticketsForUtility, tx);
  }
}

async function refundUtilityTickets(
  ctx: IContext,
  currentUserId: string,
  tickets: PrismaTicket[],
  tx: Prisma.TransactionClient,
): Promise<void> {
  const sample = tickets[0];
  const totalPoints = sample.utility.pointsRequired * tickets.length;

  const { fromWalletId, toWalletId } = await WalletValidator.validateCommunityMemberTransfer(
    ctx,
    tx,
    sample.utility.communityId,
    currentUserId,
    totalPoints,
    TransactionReason.TICKET_REFUNDED,
  );

  const transaction = await TransactionService.refundTicket(ctx, tx, {
    fromWalletId,
    toWalletId,
    transferPoints: totalPoints,
  });

  await TicketService.cancelReservedTicketsIfAvailable(ctx, tickets, currentUserId, tx);
  await TicketService.refundTickets(ctx, tickets, currentUserId, transaction.id, tx);
}

async function updateManyParticipationByReservationStatusChanged(
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
