import {
  GqlCommunity,
  GqlCommunityParticipationsArgs,
  GqlMutationParticipationAcceptApplicationArgs,
  GqlMutationParticipationAcceptMyInvitationArgs,
  GqlMutationParticipationApplyArgs,
  GqlMutationParticipationApprovePerformanceArgs,
  GqlMutationParticipationCancelInvitationArgs,
  GqlMutationParticipationCancelMyApplicationArgs,
  GqlMutationParticipationDenyApplicationArgs,
  GqlMutationParticipationDenyMyInvitationArgs,
  GqlMutationParticipationDenyPerformanceArgs,
  GqlMutationParticipationInviteArgs,
  GqlOpportunity,
  GqlOpportunityParticipationsArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotParticipationsArgs,
  GqlParticipation,
  GqlParticipationApplyPayload,
  GqlParticipationInvitePayload,
  GqlParticipationsConnection,
  GqlParticipationSetStatusPayload,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
  GqlUser,
  GqlUserParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationService from "@/application/participation/service";
import ParticipationPresenter from "@/application/participation/presenter";
import ParticipationUtils from "@/application/participation/utils";
import { getCurrentUserId } from "@/utils";
import {
  OpportunityCategory,
  ParticipationStatus,
  ParticipationStatusReason,
  Prisma,
} from "@prisma/client";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import TransactionService from "@/application/transaction/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import OpportunityService from "@/application/opportunity/service";
import TicketService from "@/application/ticket/service";

export default class ParticipationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseParticipations(
    args: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, args);
  }

  static async visitorBrowseParticipationsByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorBrowseParticipationsByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserParticipationsArgs,
    ctx: IContext,
  ) {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { userId: id },
      first,
    });
  }

  static async visitorBrowseParticipationsByOpportunity(
    { id }: GqlOpportunity,
    args: GqlOpportunityParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      ...args,
      filter: { opportunityId: id },
    });
  }

  static async visitorBrowseParticipationsByOpportunitySlot(
    { id }: GqlOpportunitySlot,
    { first, cursor }: GqlOpportunitySlotParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { opportunitySlotId: id },
      first,
    });
  }

  static async visitorViewParticipation(
    { id }: GqlQueryParticipationArgs,
    ctx: IContext,
  ): Promise<GqlParticipation | null> {
    const res = await ParticipationService.findParticipation(ctx, id);
    if (!res) {
      return null;
    }
    return ParticipationPresenter.get(res);
  }

  static async memberInviteUserToOpportunity(
    { input }: GqlMutationParticipationInviteArgs,
    ctx: IContext,
  ): Promise<GqlParticipationInvitePayload> {
    const res = await ParticipationService.inviteParticipation(ctx, input);
    return ParticipationPresenter.invite(res);
  }

  static async memberCancelInvitation(
    { id }: GqlMutationParticipationCancelInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.setStatus(
      ctx,
      id,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.CANCELED_INVITATION,
    );
    return ParticipationPresenter.setStatus(res);
  }

  static async userAcceptMyInvitation(
    { id, input }: GqlMutationParticipationAcceptMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const { communityId } = input;

    await ParticipationService.findParticipationOrThrow(ctx, id);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const res = await ParticipationService.setStatus(
        ctx,
        id,
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.ACCEPTED_INVITATION,
        tx,
      );

      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      return ParticipationPresenter.setStatus(res);
    });
  }

  static async userDenyMyInvitation(
    { id }: GqlMutationParticipationDenyMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.setStatus(
      ctx,
      id,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.DECLINED_INVITATION,
    );
    return ParticipationPresenter.setStatus(res);
  }

  static async userApplyForOpportunity(
    { input }: GqlMutationParticipationApplyArgs,
    ctx: IContext,
  ): Promise<GqlParticipationApplyPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const opportunity = await OpportunityService.findOpportunityOrThrow(ctx, input.opportunityId);
    const { communityId, requireApproval, requiredUtilities } = opportunity;

    const participationStatus = requireApproval
      ? ParticipationStatus.PENDING
      : ParticipationStatus.PARTICIPATING;

    const participation = await this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      if (requiredUtilities.length > 0 && input.ticketId) {
        await TicketService.reserveOrUseTicket(ctx, participationStatus, input.ticketId, tx);
      }

      return await ParticipationService.applyParticipation(
        ctx,
        input,
        currentUserId,
        communityId,
        participationStatus,
      );
    });

    return ParticipationPresenter.apply(participation);
  }

  static async userCancelMyApplication(
    { id, input }: GqlMutationParticipationCancelMyApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const { ticketId } = input;
    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const res = await ParticipationService.setStatus(
        ctx,
        id,
        ParticipationStatus.NOT_PARTICIPATING,
        ParticipationStatusReason.WITHDRAW_APPLICATION,
        tx,
      );

      if (ticketId) {
        await TicketService.cancelReservedTicketIfNeeded(ctx, ticketId, tx, participation.status);
      }

      return ParticipationPresenter.setStatus(res);
    });
  }

  static async managerAcceptApplication(
    { id, input }: GqlMutationParticipationAcceptApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const { ticketId, communityId } = input;

    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const res = await ParticipationService.setStatus(
        ctx,
        id,
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.ACCEPTED_APPLICATION,
        tx,
      );

      const userId = await ParticipationService.validateParticipationHasUserId(ctx, participation);
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx, userId);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      if (ticketId) {
        await TicketService.useTicketIfAvailable(ctx, ticketId, tx, participation.status);
      }

      return ParticipationPresenter.setStatus(res);
    });
  }

  static async managerDenyApplication(
    { id, input }: GqlMutationParticipationDenyApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const { ticketId } = input;
    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const res = await ParticipationService.setStatus(
        ctx,
        id,
        ParticipationStatus.NOT_PARTICIPATING,
        ParticipationStatusReason.DECLINED_APPLICATION,
        tx,
      );

      if (ticketId) {
        await TicketService.cancelReservedTicketIfNeeded(ctx, ticketId, tx, participation.status);
      }

      return ParticipationPresenter.setStatus(res);
    });
  }

  static async managerApprovePerformance(
    { id, input }: GqlMutationParticipationApprovePerformanceArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const { communityId } = input;
    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const res = await ParticipationService.setStatus(
        ctx,
        id,
        ParticipationStatus.PARTICIPATED,
        ParticipationStatusReason.QUALIFIED_PARTICIPATION,
        tx,
      );
      const opportunity = await ParticipationService.validateParticipationHasOpportunity(
        ctx,
        participation,
      );

      if (opportunity.pointsToEarn && opportunity.category === OpportunityCategory.QUEST) {
        const { fromWalletId, toWalletId } = await WalletService.validateWalletsForGiveReward(
          ctx,
          tx,
          communityId,
          id,
          opportunity.pointsToEarn,
        );

        await TransactionService.giveRewardPoint(
          ctx,
          tx,
          id,
          opportunity.pointsToEarn,
          fromWalletId,
          toWalletId,
        );
      }

      return ParticipationPresenter.setStatus(res);
    });
  }

  static async managerDenyPerformance(
    { id }: GqlMutationParticipationDenyPerformanceArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.setStatus(
      ctx,
      id,
      ParticipationStatus.PARTICIPATING,
      ParticipationStatusReason.UNQUALIFIED_PARTICIPATION,
    );
    return ParticipationPresenter.setStatus(res);
  }
}
