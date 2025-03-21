import {
  GqlMutationParticipationAcceptApplicationArgs,
  GqlMutationParticipationApplyArgs,
  GqlMutationParticipationApprovePerformanceArgs,
  GqlMutationParticipationCancelMyApplicationArgs,
  GqlMutationParticipationDenyApplicationArgs,
  GqlMutationParticipationDenyPerformanceArgs,
  GqlParticipation,
  GqlParticipationApplyPayload,
  GqlParticipationsConnection,
  GqlParticipationSetStatusPayload,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationService from "@/application/participation/service";
import ParticipationPresenter from "@/application/participation/presenter";
import { getCurrentUserId } from "@/application/utils";
import {
  OpportunityCategory,
  ParticipationEventTrigger,
  ParticipationEventType,
  ParticipationStatus,
  Prisma,
} from "@prisma/client";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import TransactionService from "@/application/transaction/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import OpportunityService from "@/application/opportunity/service";
import TicketService from "@/application/ticket/service";
import { NotFoundError } from "@/errors/graphql";

export default class ParticipationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseParticipations(
    args: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationService.fetchParticipations(ctx, args);
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

    const isFirstApply = await ParticipationService.hasNoParticipationYet(
      ctx,
      currentUserId,
      opportunity.category,
    );

    const participation = await this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      if (!communityId) {
        throw new NotFoundError("Community with Opportunity", { communityId });
      }
      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      if (isFirstApply) {
        //TODO 初申し込みでのオンボーディングポイントを付与する ユーザー登録時にオンボーディングタスク生成
      }

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
        ParticipationEventType.APPLICATION,
        ParticipationEventTrigger.CANCELED,
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
        ParticipationEventType.APPLICATION,
        ParticipationEventTrigger.ACCEPTED,
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
        ParticipationEventType.APPLICATION,
        ParticipationEventTrigger.DECLINED,
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
        ParticipationEventType.EVALUATION,
        ParticipationEventTrigger.ACCEPTED,
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
      ParticipationEventType.EVALUATION,
      ParticipationEventTrigger.DECLINED,
    );
    return ParticipationPresenter.setStatus(res);
  }
}
