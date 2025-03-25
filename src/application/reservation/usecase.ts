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
  GqlReservationCreateInput,
  GqlReservationPaymentMethod,
  GqlMutationReservationCancelArgs,
  GqlReservationCancelInput,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ReservationService from "@/application/reservation/service";
import ReservationPresenter from "@/application/reservation/presenter";
import {
  ParticipationStatusReason,
  ParticipationStatus,
  ReservationStatus,
  TransactionReason,
  Prisma,
  OpportunityCategory,
  Todo,
  TicketStatus,
  TicketStatusReason,
} from "@prisma/client";
import { getCurrentUserId, runOnboardingReward } from "@/application/utils";
import OpportunitySlotService from "@/application/opportunitySlot/service";
import WalletService from "@/application/membership/wallet/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationService from "@/application/participation/service";
import OpportunityService from "@/application/opportunity/service";
import TicketService from "@/application/ticket/service";
import TransactionService from "@/application/transaction/service";
import { PrismaOpportunitySlot } from "@/application/opportunitySlot/data/type";
import MembershipService from "@/application/membership/service";
import { OnboardingTodoPoints } from "@/consts/utils";
import { groupBy } from "graphql/jsutils/groupBy";
import { PrismaTicket } from "@/application/ticket/data/type";
import ReservationValidator from "@/application/reservation/validator";
import { reservationStatuses } from "@/application/reservation/helper";
import { PrismaParticipation } from "@/application/participation/data/type";
import ParticipationStatusHistoryService from "@/application/participation/statusHistory/service";
import { NotFoundError } from "@/errors/graphql";
import WalletValidator from "@/application/membership/wallet/validator";

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

    await ReservationService.checkConflictBeforeReservation(
      ctx,
      currentUserId,
      slot.startsAt,
      slot.endsAt,
    );
    const currentCount = await ParticipationService.countActiveParticipantsBySlotId(ctx, slot.id);
    ReservationValidator.validateCapacity(slot.capacity, input.participantCount, currentCount);

    const statuses = resolveReservationStatuses(opportunity.requireApproval);

    const { communityId, requiredUtilities, category } = opportunity;
    if (!communityId) throw new NotFoundError("Community id not found", { communityId });

    const reservation = await this.issuer.public(ctx, async (tx) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      await rewardOnboardingPointsIfFirstReservation(ctx, currentUserId, category, tx);
      const reservation = await ReservationService.createReservation(
        ctx,
        input.opportunitySlotId,
        input.participantCount,
        input.userIdsIfExists,
        statuses,
      );

      const participationIds = reservation.participations.map((p) => p.id);
      await handleReserveTicketAfterPurchaseIfNeeded(
        ctx,
        tx,
        input,
        communityId,
        currentUserId,
        requiredUtilities,
        participationIds,
      );

      return reservation;
    });

    return ReservationPresenter.create(reservation);
  }

  static async userCancelMyReservation(
    { id, input }: GqlMutationReservationCancelArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const reservation = await ReservationService.findReservationOrThrow(ctx, id);
    ReservationValidator.validateCancellable(reservation.opportunitySlot.startsAt);

    return this.issuer.public(ctx, async (tx) => {
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

      return ReservationPresenter.setStatus(reservation);
    });
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

    const reservation = await this.issuer.public(ctx, async (tx) => {
      const reservation = await ReservationService.setStatus(
        ctx,
        id,
        currentUserId,
        ReservationStatus.ACCEPTED,
        tx,
      );
      await updateManyParticipationByReservationStatusChanged(
        ctx,
        reservation.participations,
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.RESERVATION_ACCEPTED,
        tx,
      );

      return reservation;
    });

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
}

//  ------------------------------
//  function for reservation usecase
//  ------------------------------
function resolveReservationStatuses(requireApproval: boolean): reservationStatuses {
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

async function rewardOnboardingPointsIfFirstReservation(
  ctx: IContext,
  userId: string,
  category: OpportunityCategory,
  tx: Prisma.TransactionClient,
) {
  const count = await ReservationService.countUserReservationsByCategory(ctx, userId, category, tx);
  if (count > 0) return;

  const todo = category === OpportunityCategory.ACTIVITY ? Todo.FIRST_ACTIVITY : Todo.FIRST_QUEST;
  await runOnboardingReward(ctx, userId, todo, OnboardingTodoPoints[todo], tx);
}

async function handleReserveTicketAfterPurchaseIfNeeded(
  ctx: IContext,
  tx: Prisma.TransactionClient,
  input: GqlReservationCreateInput,
  communityId: string,
  userId: string,
  requiredUtilities: PrismaOpportunitySlot["opportunity"]["requiredUtilities"],
  participationIds: string[],
): Promise<void> {
  if (requiredUtilities.length === 0) return;
  if (input.paymentMethod !== GqlReservationPaymentMethod.Point) return;

  const utility = OpportunityService.getSingleRequiredUtility(requiredUtilities);
  const totalTransferPoints = utility.pointsRequired * input.participantCount;

  const { fromWalletId, toWalletId } = await WalletValidator.validateCommunityMemberTransfer(
    ctx,
    tx,
    communityId,
    userId,
    totalTransferPoints,
    TransactionReason.TICKET_PURCHASED,
  );

  const transaction = await TransactionService.purchaseTicket(ctx, tx, {
    fromWalletId,
    toWalletId,
    transferPoints: totalTransferPoints,
  });

  const tickets = await TicketService.purchaseManyTickets(
    ctx,
    fromWalletId,
    utility.id,
    transaction.id,
    participationIds,
    tx,
  );

  await TicketService.reserveManyTickets(ctx, tickets, tx);
}

async function handleRefundTicketAfterCancelIfNeeded(
  ctx: IContext,
  currentUserId: string,
  input: GqlReservationCancelInput,
  tx: Prisma.TransactionClient,
): Promise<void> {
  if (input.paymentMethod !== GqlReservationPaymentMethod.Point) return;
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
