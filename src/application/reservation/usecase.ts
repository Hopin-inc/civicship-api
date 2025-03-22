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
} from "@prisma/client";
import { getCurrentUserId, runOnboardingReward } from "@/application/utils";
import OpportunitySlotService from "@/application/opportunitySlot/service";
import WalletService from "@/application/membership/wallet/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationService from "@/application/participation/service";
import ParticipationStatusHistoryService from "@/application/participation/statusHistory/service";
import { PrismaReservation } from "@/application/reservation/data/type";
import OpportunityService from "@/application/opportunity/service";
import TicketService from "@/application/ticket/service";
import TransactionService from "@/application/transaction/service";
import { PrismaOpportunitySlot } from "@/application/opportunitySlot/data/type";
import MembershipService from "@/application/membership/service";
import { OnboardingTodoPoints } from "@/consts/utils";

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
    const opportunity = ReservationService.validateReservationOpportunityOfDb(
      slot.opportunity,
      input.opportunitySlotId,
    );

    await validateBeforeReservation(ctx, currentUserId, slot, input);
    const statuses = resolveReservationStatuses(opportunity.requireApproval);

    const { communityId, requiredUtilities, opportunityCategory } = opportunity;
    const { reservationStatus, participationStatus, participationStatusReason } = statuses;

    const reservation = await this.issuer.public(ctx, async (tx) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      await rewardOnboardingPointsIfFirstReservation(ctx, currentUserId, opportunityCategory, tx);
      const reservation = await ReservationService.createReservation(
        ctx,
        input.opportunitySlotId,
        input.participantCount,
        input.userIdsIfExists,
        reservationStatus,
        participationStatus,
        participationStatusReason,
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

  // TODO create
  // static async userCancelMyReservation(
  //   { id, input }: GqlMutationReservationCancelArgs,
  //   ctx: IContext,
  // ): Promise<GqlReservationSetStatusPayload> {
  //   const reservation = await ReservationService.findReservationOrThrow(ctx, id);
  //   ReservationService.validateCancellable(reservation.opportunitySlot.startsAt);
  // }

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

  static async managerAcceptReservation(
    { id }: GqlMutationReservationAcceptArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const reservation = await handleReservationStatusChange(
      ctx,
      this.issuer,
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
    const reservation = await handleReservationStatusChange(
      ctx,
      this.issuer,
      id,
      ReservationStatus.REJECTED,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.RESERVATION_REJECTED,
    );

    return ReservationPresenter.setStatus(reservation);
  }
}

//  ------------------------------
//  function for reservation usecase
//  ------------------------------
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

async function validateBeforeReservation(
  ctx: IContext,
  userId: string,
  slot: PrismaOpportunitySlot,
  input: GqlReservationCreateInput,
) {
  const { startsAt, endsAt, capacity } = slot;
  await ReservationService.checkConflictBeforeReservation(ctx, userId, startsAt, endsAt);

  const currentCount = await ParticipationService.countActiveParticipantsBySlotId(
    ctx,
    input.opportunitySlotId,
  );

  ReservationService.validateCapacity(capacity, input.participantCount, currentCount);
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

  const { fromWalletId, toWalletId } = await WalletService.validateCommunityMemberTransfer(
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

async function handleReservationStatusChange(
  ctx: IContext,
  issuer: PrismaClientIssuer,
  reservationId: string,
  reservationStatus: ReservationStatus,
  participationStatus: ParticipationStatus,
  participationReason: ParticipationStatusReason,
): Promise<PrismaReservation> {
  const currentUserId = getCurrentUserId(ctx);

  return issuer.public(ctx, async (tx) => {
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
