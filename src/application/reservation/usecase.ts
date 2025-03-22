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
  GqlReservationPayment,
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
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationService from "@/application/participation/service";
import ParticipationStatusHistoryService from "@/application/participation/statusHistory/service";
import { PrismaReservation } from "@/application/reservation/data/type";
import OpportunityService from "@/application/opportunity/service";
import TicketService from "@/application/ticket/service";
import TransactionService from "@/application/transaction/service";
import { PrismaOpportunitySlot } from "@/application/opportunitySlot/data/type";
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
    const { opportunity, capacity, startsAt, endsAt } = slot;
    const { communityId, requireApproval, requiredUtilities, opportunityCategory } =
      ReservationService.validateReservationOpportunityOfDb(opportunity, input.opportunitySlotId);

    await ReservationService.checkConflictBeforeReservation(ctx, currentUserId, startsAt, endsAt);
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

      const count = await ReservationService.countUserReservationsByCategory(
        ctx,
        currentUserId,
        opportunityCategory,
        tx,
      );
      if (count === 0) {
        const todo =
          opportunityCategory === OpportunityCategory.ACTIVITY
            ? Todo.FIRST_ACTIVITY
            : Todo.FIRST_QUEST;

        await runOnboardingReward(ctx, currentUserId, todo, OnboardingTodoPoints[todo], tx);
      }

      if (requiredUtilities.length > 0 && input.payment === GqlReservationPayment.Point) {
        await handleTicketPurchaseAndReserve(
          ctx,
          tx,
          communityId,
          currentUserId,
          requiredUtilities,
          input.participantCount,
        );
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

  //TODO チケットの払い戻しに伴うトランザクションとかも踏まえた実装
  static async userCancelMyReservation(
    { id }: GqlMutationReservationCancelArgs,
    ctx: IContext,
  ): Promise<GqlReservationSetStatusPayload> {
    const reservation = await handleReservationStatusChange(
      ctx,
      this.issuer,
      id,
      ReservationStatus.CANCELED,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.RESERVATION_CANCELED,
    );
    ReservationService.validateCancellable(reservation.opportunitySlot.startsAt);

    return ReservationPresenter.setStatus(reservation);
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

async function handleTicketPurchaseAndReserve(
  ctx: IContext,
  tx: Prisma.TransactionClient,
  communityId: string,
  userId: string,
  requiredUtilities: PrismaOpportunitySlot["opportunity"]["requiredUtilities"],
  participantCount: number,
): Promise<void> {
  const utility = OpportunityService.getSingleRequiredUtility(requiredUtilities);
  const totalTransferPoints = utility.pointsRequired * participantCount;

  const { fromWalletId, toWalletId } = await WalletService.validateCommunityMemberTransfer(
    ctx,
    tx,
    communityId,
    userId,
    totalTransferPoints,
    TransactionReason.TICKET_REFUNDED,
  );

  const transaction = await TransactionService.purchaseTicket(ctx, tx, {
    fromWalletId,
    toWalletId,
    transferPoints: totalTransferPoints,
  });

  await TicketService.purchaseAndReserveTickets(
    ctx,
    fromWalletId,
    utility.id,
    transaction.id,
    participantCount,
    tx,
  );
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
