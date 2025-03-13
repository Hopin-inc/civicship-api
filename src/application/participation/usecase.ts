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
  Prisma,
  TicketStatus,
  TicketStatusReason,
} from "@prisma/client";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import TransactionService from "@/application/transaction/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import OpportunityService from "@/application/opportunity/service";
import ParticipationConverter from "@/application/participation/data/converter";
import TicketService from "@/application/ticket/service";
import { GiveRewardPointParams } from "@/application/transaction/data/converter";

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
    const res = await ParticipationService.setStatus(ctx, id, ParticipationStatus.CANCELED);
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
      ? ParticipationStatus.APPLIED
      : ParticipationStatus.PARTICIPATING;

    const data: Prisma.ParticipationCreateInput = ParticipationConverter.apply(
      input,
      currentUserId,
      communityId,
      participationStatus,
    );

    const reserveOrUseTicket = async (tx: Prisma.TransactionClient) => {
      if (requiredUtilities.length > 0 && input.ticketId) {
        switch (participationStatus) {
          case ParticipationStatus.PARTICIPATING:
            await TicketService.reserveTicket(ctx, input.ticketId, tx);
            break;
          case ParticipationStatus.APPLIED:
            await TicketService.useTicket(ctx, input.ticketId, tx);
            break;
          default:
            break;
        }
      }
    };

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      await reserveOrUseTicket(tx);

      const participation = await ParticipationService.applyParticipation(ctx, currentUserId, data);
      return ParticipationPresenter.apply(participation);
    });
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
        tx,
      );

      if (ticketId) {
        const ticket = await TicketService.findTicketOrThrow(ctx, ticketId);
        if (
          participation.status === ParticipationStatus.APPLIED &&
          ticket.status === TicketStatus.DISABLED &&
          ticket.reason === TicketStatusReason.RESERVED
        ) {
          await TicketService.cancelReservedTicket(ctx, ticketId, tx);
        }
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
        tx,
      );

      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      if (ticketId) {
        const ticket = await TicketService.findTicketOrThrow(ctx, ticketId);
        if (
          participation.status === ParticipationStatus.APPLIED &&
          ticket.status === TicketStatus.AVAILABLE
        ) {
          await TicketService.useTicket(ctx, ticketId, tx);
        }
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
        tx,
      );

      if (ticketId) {
        const ticket = await TicketService.findTicketOrThrow(ctx, ticketId);
        if (
          participation.status === ParticipationStatus.APPLIED &&
          ticket.status === TicketStatus.DISABLED &&
          ticket.reason === TicketStatusReason.RESERVED
        ) {
          await TicketService.cancelReservedTicket(ctx, ticketId, tx);
        }
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
      const res = await ParticipationService.setStatus(ctx, id, ParticipationStatus.APPROVED, tx);
      const { opportunity } = await ParticipationUtils.validateParticipation(
        ctx,
        tx,
        participation,
      );

      if (opportunity.pointsToEarn && opportunity.category === OpportunityCategory.QUEST) {
        const fromPointChange = -opportunity.pointsToEarn;
        const toPointChange = opportunity.pointsToEarn;

        const { fromWalletId, toWalletId } = await WalletService.findWalletsForGiveReward(
          ctx,
          tx,
          communityId,
          id,
          fromPointChange,
        );

        const data: GiveRewardPointParams = {
          fromWalletId,
          fromPointChange,
          toWalletId,
          toPointChange,
          participationId: id,
        };
        await TransactionService.giveRewardPoint(ctx, tx, data);
      }

      return ParticipationPresenter.setStatus(res);
    });
  }

  static async managerDenyPerformance(
    { id }: GqlMutationParticipationDenyPerformanceArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.setStatus(ctx, id, ParticipationStatus.DENIED);
    return ParticipationPresenter.setStatus(res);
  }
}
